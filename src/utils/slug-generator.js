import { formatFieldValue } from './value-formatter.js';

/**
 * Sanitize a slug string according to WordPress standards.
 *
 * @param {string} slug The slug to sanitize.
 * @return {string} The sanitized slug.
 */
export function sanitizeSlug( slug ) {
	// Remove empty segments
	const slugParts = slug
		.split( '-' )
		.filter( ( part ) => part.trim() !== '' );

	slug = slugParts.join( '-' );

	// Sanitize: lowercase, remove non-alphanumeric except hyphens, collapse multiple hyphens
	slug = slug
		.toLowerCase()
		.replace( /[^a-z0-9-]/g, '-' )
		.replace( /-+/g, '-' )
		.replace( /^-|-$/g, '' );

	return slug;
}

/**
 * Generate slug from template using post data.
 *
 * @param {string} template      The slug template with variables.
 * @param {Array}  variables     Parsed variables from template.
 * @param {Object} postFields    Object containing post field values.
 * @param {Object} meta          Object containing meta field values.
 * @param {Object} taxonomyTerms Object containing taxonomy term slugs.
 * @return {string} The generated slug.
 */
export function generateSlugFromTemplate(
	template,
	variables,
	postFields,
	meta,
	taxonomyTerms
) {
	if ( ! template ) {
		return '';
	}

	// Replace each variable in the template
	const slug = template.replace( /\{([^}]+)\}/g, ( match, variable ) => {
		// Find the matching variable object
		const varObj = variables.find( ( v ) => v.raw === variable );

		if ( ! varObj ) {
			return '';
		}

		if ( varObj.isTax ) {
			// Get taxonomy terms
			const value =
				taxonomyTerms && taxonomyTerms[ varObj.field ]
					? taxonomyTerms[ varObj.field ]
					: '';
			return value;
		}

		if ( varObj.isMeta ) {
			// Get meta field value
			let value =
				meta && meta[ varObj.field ] !== undefined
					? meta[ varObj.field ]
					: '';

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

			const formatted = formatFieldValue(
				varObj.field,
				value,
				varObj.format,
				true // isMeta = true
			);
			return formatted;
		}

		// Get post field value
		const value = postFields[ varObj.field ];
		const formatted = formatFieldValue(
			varObj.field,
			value,
			varObj.format,
			false // isMeta = false
		);
		return formatted;
	} );

	return sanitizeSlug( slug );
}
