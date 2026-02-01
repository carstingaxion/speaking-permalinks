
import { registerPlugin } from '@wordpress/plugins';
import { useEffect, useRef, useMemo } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { useEntityProp } from '@wordpress/core-data';
import { store as editorStore } from '@wordpress/editor';
import { dateI18n } from '@wordpress/date';

/**
 * Parse template and extract all variables with their formatting options.
 * 
 * @param {string} template The slug template.
 * @return {Array} Array of variable objects with field, arrayKey, format, isMeta, and isTax properties.
 */
function parseTemplateVariables( template ) {
	if ( ! template ) {
		return [];
	}
	
	const variables = [];
	const regex = /\{([^}]+)\}/g;
	let match;
	
	while ( ( match = regex.exec( template ) ) !== null ) {
		const variable = match[ 1 ];
		
		// Check if it's a meta field or taxonomy
		const isMeta = variable.startsWith( 'meta:' );
		const isTax = variable.startsWith( 'tax:' );
		
		// Remove prefix if present
		const withoutPrefix = isMeta ? variable.substring( 5 ) : ( isTax ? variable.substring( 4 ) : variable );
		
		// Split by | to get field and format (format comes last)
		const parts = withoutPrefix.split( '|' );
		const format = parts.length > 1 ? parts[ parts.length - 1 ] : null;
		
		// The field part may contain array access notation (field:array_key)
		const fieldPart = parts[ 0 ];
		const fieldParts = fieldPart.split( ':' );
		const field = fieldParts[ 0 ];
		const arrayKey = fieldParts.length > 1 ? fieldParts[ 1 ] : null;
		
		variables.push( {
			field,
			arrayKey,
			format,
			isMeta,
			isTax,
			raw: variable,
		} );
	}
	
	return variables;
}

/**
 * Slug Generator Component
 * 
 * This component handles the actual slug generation logic.
 * It's only rendered when postType and postId are available.
 */
const SlugGeneratorCore = ( { postType, postId, template } ) => {
	// Parse template to get all variables
	const variables = useMemo( () => parseTemplateVariables( template ), [ template ] );
	
	// Get all unique post fields needed
	const postFieldsNeeded = useMemo( () => [
		...new Set(
			variables
				.filter( ( v ) => ! v.isMeta && ! v.isTax )
				.map( ( v ) => v.field )
		)
	], [ variables ] );
	
	// Get all unique meta fields needed
	const metaFieldsNeeded = useMemo( () => [
		...new Set(
			variables
				.filter( ( v ) => v.isMeta )
				.map( ( v ) => v.field )
		)
	], [ variables ] );
	
	// Get all unique taxonomies needed (these are taxonomy slugs from the template)
	const taxonomySlugsNeeded = useMemo( () => [
		...new Set(
			variables
				.filter( ( v ) => v.isTax )
				.map( ( v ) => v.field )
		)
	], [ variables ] );
	
	// Get all post data in one useSelect call
	const postFieldValues = useSelect(
		( select ) => {
			const { getEditedPostAttribute } = select( editorStore );
			const values = {};
			
			postFieldsNeeded.forEach( ( field ) => {
				try {
					values[ field ] = getEditedPostAttribute( field );
				} catch ( error ) {
					values[ field ] = '';
				}
			} );
			
			return values;
		},
		[ postFieldsNeeded.join( ',' ), postType, postId ]
	);
	
	// Get meta fields
	const [ meta ] = useEntityProp( 'postType', postType, 'meta', postId );
	
	// Get actual taxonomy REST bases from WordPress
	const actualTaxonomyRestBases = useSelect(
		( select ) => {
			const restBases = {};
			
			taxonomySlugsNeeded.forEach( ( taxonomySlug ) => {
				const taxonomy = select( 'core' ).getTaxonomy( taxonomySlug );
				
				if ( taxonomy ) {
					const restBase = taxonomy.rest_base || taxonomySlug;
					restBases[ taxonomySlug ] = restBase;
				} else {
					restBases[ taxonomySlug ] = taxonomySlug;
				}
			} );
			
			return restBases;
		},
		[ taxonomySlugsNeeded.join( ',' ) ]
	);
	
	// Get actual taxonomy term IDs from WordPress
	const actualTaxonomyTermIds = useSelect(
		( select ) => {
			const { getEditedPostAttribute } = select( editorStore );
			const ids = {};
			
			taxonomySlugsNeeded.forEach( ( taxonomySlug ) => {
				const restBase = actualTaxonomyRestBases[ taxonomySlug ] || taxonomySlug;
				try {
					const termIds = getEditedPostAttribute( restBase );
					ids[ taxonomySlug ] = termIds || [];
				} catch ( error ) {
					ids[ taxonomySlug ] = [];
				}
			} );
			
			return ids;
		},
		[ taxonomySlugsNeeded.join( ',' ), JSON.stringify( actualTaxonomyRestBases ), postType, postId ]
	);
	
	// Get actual taxonomy terms from WordPress
	const rawTaxonomyTerms = useSelect(
		( select ) => {
			const terms = {};
			
			taxonomySlugsNeeded.forEach( ( taxonomySlug ) => {
				const ids = actualTaxonomyTermIds[ taxonomySlug ];
				
				if ( ids && ids.length > 0 ) {
					const termObjects = ids
						.map( ( id ) => {
							const term = select( 'core' ).getEntityRecord( 'taxonomy', taxonomySlug, id );
							return term;
						} )
						.filter( Boolean );
					
					if ( termObjects.length > 0 ) {
						const slugs = termObjects.map( ( term ) => term.slug );
						terms[ taxonomySlug ] = slugs.join( '-' );
					}
				}
			} );
			
			return terms;
		},
		[ JSON.stringify( actualTaxonomyTermIds ), taxonomySlugsNeeded.join( ',' ) ]
	);
	
	// Memoize the taxonomy terms to prevent unnecessary re-renders
	const actualTaxonomyTerms = useMemo(
		() => rawTaxonomyTerms,
		[ JSON.stringify( rawTaxonomyTerms ) ]
	);
	
	// Get the current slug for comparison
	const [ currentSlug, setPostSlug ] = useEntityProp( 'postType', postType, 'slug', postId );
	
	const lastGeneratedSlug = useRef( '' );
	
	useEffect( () => {
		// Only generate slug if we have the necessary data
		if ( ! postId || ! template ) {
			return;
		}
		
		// Check if template is just the default
		if ( template === '{title}' ) {
			return;
		}
		
		// Debounce slug generation
		const timeoutId = setTimeout( () => {
			const generatedSlug = generateSlugFromTemplate(
				template,
				variables,
				postFieldValues,
				meta || {},
				actualTaxonomyTerms || {}
			);
			
			// Only update if the slug has changed and it's different from what we last generated
			if ( generatedSlug && generatedSlug !== currentSlug && generatedSlug !== lastGeneratedSlug.current ) {
				lastGeneratedSlug.current = generatedSlug;
				setPostSlug( generatedSlug );
			}
		}, 200 );
		
		return () => clearTimeout( timeoutId );
	}, [ 
		postId, 
		template, 
		JSON.stringify( postFieldValues ), 
		JSON.stringify( meta ), 
		JSON.stringify( actualTaxonomyTermIds ), 
		JSON.stringify( actualTaxonomyTerms ), 
		currentSlug, 
		setPostSlug,
		variables
	] );
	
	return null;
};

/**
 * Dynamic Slug Generator Plugin
 * 
 * This plugin monitors post data changes and automatically generates slugs
 * based on the template defined in post type support configuration.
 * 
 * Only renders when the current post type supports 'speaking-permalinks'.
 */
const DynamicSlugGenerator = () => {
	const { postType, postId, hasSpeakingPermalinksSupport, template } = useSelect(
		( select ) => {
			const editor = select( editorStore );
			
			if ( ! editor ) {
				return {
					postType: null,
					postId: null,
					hasSpeakingPermalinksSupport: false,
					template: '',
				};
			}
			
			const currentPostType = editor.getCurrentPostType();
			const postTypeObject = select( 'core' ).getPostType( currentPostType );
			
			// Check if post type supports speaking permalinks
			const supports = postTypeObject?.supports || {};
			const hasSpeakingPermalinks = supports[ 'speaking-permalinks' ][0] || false;
			
			// Get the template from post type support config
			let templateValue = '';
			if ( hasSpeakingPermalinks ) {
				templateValue = hasSpeakingPermalinks.template;
			}
			
			return {
				postType: currentPostType,
				postId: editor.getCurrentPostId(),
				hasSpeakingPermalinksSupport: hasSpeakingPermalinks,
				template: templateValue,
			};
		},
		[]
	);
	// console.log('DynamicSlugGenerator render:', { postType, postId, hasSpeakingPermalinksSupport, template });
	// Only render if the post type supports speaking permalinks
	if ( ! hasSpeakingPermalinksSupport ) {
		return null;
	}
	
	// Only render the core component when we have the required data
	if ( ! postType || ! postId || ! template ) {
		return null;
	}
	
	return <SlugGeneratorCore postType={ postType } postId={ postId } template={ template } />;
};

/**
 * Format a value based on the field type and format specification.
 * 
 * @param {string} field The field name.
 * @param {*} value The field value.
 * @param {string|null} format The format specification (e.g., 'Y-m-d', 'lower').
 * @return {string} The formatted value.
 */
function formatFieldValue( field, value, format ) {
	if ( ! value ) {
		return '';
	}
	
	// Extract raw value if it's an object with raw property
	let rawValue = value;
	if ( typeof value === 'object' && value !== null ) {
		if ( value.raw !== undefined ) {
			rawValue = value.raw;
		} else if ( value.rendered !== undefined ) {
			rawValue = String( value.rendered ).replace( /<[^>]*>/g, '' );
		} else {
			rawValue = String( value );
		}
	}
	
	// Handle date formatting
	if ( field === 'date' && format ) {
		try {
			return dateI18n( format, rawValue );
		} catch ( error ) {
			// Fallback to manual formatting if dateI18n fails
			try {
				const date = new Date( rawValue );
				if ( ! isNaN( date.getTime() ) ) {
					const year = date.getFullYear();
					const month = String( date.getMonth() + 1 ).padStart( 2, '0' );
					const day = String( date.getDate() ).padStart( 2, '0' );
					
					// Handle common format patterns
					if ( format === 'Y-m-d' ) {
						return `${ year }-${ month }-${ day }`;
					}
					if ( format === 'Y' ) {
						return String( year );
					}
					if ( format === 'm' ) {
						return month;
					}
					if ( format === 'd' ) {
						return day;
					}
				}
			} catch ( dateError ) {
				console.error( '[Speaking Permalinks] Date formatting error:', dateError );
				return '';
			}
		}
	}
	
	// Handle date without format (default to Y-m-d)
	if ( field === 'date' && ! format ) {
		try {
			const date = new Date( rawValue );
			if ( ! isNaN( date.getTime() ) ) {
				const year = date.getFullYear();
				const month = String( date.getMonth() + 1 ).padStart( 2, '0' );
				const day = String( date.getDate() ).padStart( 2, '0' );
				return `${ year }-${ month }-${ day }`;
			}
		} catch ( error ) {
			console.error( '[Speaking Permalinks] Date parsing error:', error );
			return '';
		}
	}
	
	// Convert to string
	let stringValue = String( rawValue );
	
	// Apply text formatting if specified
	if ( format ) {
		if ( format === 'lower' ) {
			stringValue = stringValue.toLowerCase();
		} else if ( format === 'upper' ) {
			stringValue = stringValue.toUpperCase();
		}
	}
	
	return stringValue;
}

/**
 * Generate slug from template using post data.
 * 
 * @param {string} template The slug template with variables.
 * @param {Array} variables Parsed variables from template.
 * @param {Object} postFields Object containing post field values.
 * @param {Object} meta Object containing meta field values.
 * @param {Object} taxonomyTerms Object containing taxonomy term slugs.
 * @return {string} The generated slug.
 */
function generateSlugFromTemplate( template, variables, postFields, meta, taxonomyTerms ) {
	if ( ! template ) {
		return '';
	}
	
	// Replace each variable in the template
	let slug = template.replace( /\{([^}]+)\}/g, ( match, variable ) => {
		// Find the matching variable object
		const varObj = variables.find( ( v ) => v.raw === variable );
		
		if ( ! varObj ) {
			return '';
		}
		
		if ( varObj.isTax ) {
			// Get taxonomy terms
			const value = taxonomyTerms && taxonomyTerms[ varObj.field ] ? taxonomyTerms[ varObj.field ] : '';
			return value;
		} else if ( varObj.isMeta ) {
			// Get meta field value
			let value = meta && meta[ varObj.field ] !== undefined ? meta[ varObj.field ] : '';
			
			// Handle array access if arrayKey is specified
			if ( varObj.arrayKey && value ) {
				// Check if value is an array or object
				if ( typeof value === 'object' && value !== null ) {
					value = value[ varObj.arrayKey ];
					
					// If still undefined or null after accessing array key, return empty
					if ( value === undefined || value === null ) {
						return '';
					}
				} else {
					// Value is not an array/object, can't access array key
					return '';
				}
			}
			
			const formatted = formatFieldValue( varObj.field, value, varObj.format );
			return formatted;
		} else {
			// Get post field value
			const value = postFields[ varObj.field ];
			const formatted = formatFieldValue( varObj.field, value, varObj.format );
			return formatted;
		}
	} );
	
	// Clean up the slug: remove empty segments
	const slugParts = slug
		.split( '-' )
		.filter( ( part ) => part.trim() !== '' );
	
	slug = slugParts.join( '-' );
	
	// Sanitize the slug (basic sanitization)
	slug = slug
		.toLowerCase()
		.replace( /[^a-z0-9-]/g, '-' )
		.replace( /-+/g, '-' )
		.replace( /^-|-$/g, '' );
	
	return slug;
}

// Register the plugin
registerPlugin( 'speaking-permalinks', {
	render: DynamicSlugGenerator,
} );