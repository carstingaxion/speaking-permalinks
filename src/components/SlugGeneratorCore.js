import { useEffect, useRef, useMemo } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { useEntityProp } from '@wordpress/core-data';
import { store as editorStore } from '@wordpress/editor';

import {
	parseTemplateVariables,
	extractRequiredFields,
} from '../utils/template-parser';
import { generateSlugFromTemplate } from '../utils/slug-generator';
import { useTaxonomyData, useTaxonomyTerms } from '../hooks/use-taxonomy-data';

/**
 * Slug Generator Core Component
 *
 * This component handles the actual slug generation logic.
 * It's only rendered when postType and postId are available.
 *
 * @param {Object} props          Component props.
 * @param {string} props.postType The post type.
 * @param {number} props.postId   The post ID.
 * @param {string} props.template The slug template.
 * @return {null} This component doesn't render anything.
 */
export const SlugGeneratorCore = ( { postType, postId, template } ) => {
	// Parse template to get all variables
	const variables = useMemo(
		() => parseTemplateVariables( template ),
		[ template ]
	);

	// Extract required fields from variables
	const { postFields: postFieldsNeeded, taxonomySlugs: taxonomySlugsNeeded } =
		useMemo( () => extractRequiredFields( variables ), [ variables ] );

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
		[ postFieldsNeeded ]
	);

	// Get meta fields
	const [ meta ] = useEntityProp( 'postType', postType, 'meta', postId );

	// Get taxonomy data using custom hooks
	const { taxonomyTermIds } = useTaxonomyData( taxonomySlugsNeeded );

	const taxonomyTerms = useTaxonomyTerms(
		taxonomySlugsNeeded,
		taxonomyTermIds
	);

	// Get the current slug for comparison
	const [ currentSlug, setPostSlug ] = useEntityProp(
		'postType',
		postType,
		'slug',
		postId
	);

	const lastGeneratedSlug = useRef( '' );

	const postFieldValuesString = JSON.stringify( postFieldValues );
	const postFieldValuesKey = useMemo(
		() => postFieldValuesString,
		[ postFieldValuesString ]
	);

	const metaString = JSON.stringify( meta );
	const metaKey = useMemo( () => metaString, [ metaString ] );

	const taxonomyTermIdsString = JSON.stringify( taxonomyTermIds );
	const taxonomyTermIdsKey = useMemo(
		() => taxonomyTermIdsString,
		[ taxonomyTermIdsString ]
	);

	const taxonomyTermsString = JSON.stringify( taxonomyTerms );
	const taxonomyTermsKey = useMemo(
		() => taxonomyTermsString,
		[ taxonomyTermsString ]
	);

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
				taxonomyTerms || {}
			);

			// Only update if the slug has changed and it's different from what we last generated
			if (
				generatedSlug &&
				generatedSlug !== currentSlug &&
				generatedSlug !== lastGeneratedSlug.current
			) {
				lastGeneratedSlug.current = generatedSlug;
				setPostSlug( generatedSlug );
			}
		}, 200 );

		return () => clearTimeout( timeoutId );
	}, [
		postId,
		template,
		postFieldValuesKey,
		metaKey,
		taxonomyTermIdsKey,
		taxonomyTermsKey,
		currentSlug,
		setPostSlug,
		variables,
		postFieldValues,
		meta,
		taxonomyTerms,
	] );

	return null;
};
