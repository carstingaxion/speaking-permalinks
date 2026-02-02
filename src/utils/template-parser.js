/**
 * Parse template and extract all variables with their formatting options.
 *
 * @param {string} template The slug template.
 * @return {Array} Array of variable objects with field, arrayKey, format, isMeta, and isTax properties.
 */
export function parseTemplateVariables( template ) {
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
		const withoutPrefix = isMeta
			? variable.substring( 5 )
			: isTax
			? variable.substring( 4 )
			: variable;

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
 * Extract unique fields needed from parsed variables.
 *
 * @param {Array} variables Parsed template variables.
 * @return {Object} Object containing postFields, metaFields, and taxonomySlugs arrays.
 */
export function extractRequiredFields( variables ) {
	const postFields = [
		...new Set(
			variables
				.filter( ( v ) => ! v.isMeta && ! v.isTax )
				.map( ( v ) => v.field )
		),
	];

	const metaFields = [
		...new Set(
			variables.filter( ( v ) => v.isMeta ).map( ( v ) => v.field )
		),
	];

	const taxonomySlugs = [
		...new Set(
			variables.filter( ( v ) => v.isTax ).map( ( v ) => v.field )
		),
	];

	return { postFields, metaFields, taxonomySlugs };
}
