import { dateI18n } from '@wordpress/date';

/**
 * Format a date value with the specified PHP date format.
 *
 * @param {string} rawValue The raw date value.
 * @param {string} format   The PHP date format string.
 * @return {string} The formatted date string.
 */
export function formatDateValue( rawValue, format ) {
	if ( ! rawValue ) {
		return '';
	}

	// Try using WordPress's dateI18n first
	if ( format ) {
		try {
			return dateI18n( format, rawValue );
		} catch ( error ) {
			// Fallback to manual formatting
		}
	}

	// Manual date formatting fallback
	try {
		const date = new Date( rawValue );
		if ( isNaN( date.getTime() ) ) {
			return '';
		}

		const year = date.getFullYear();
		const month = String( date.getMonth() + 1 ).padStart( 2, '0' );
		const day = String( date.getDate() ).padStart( 2, '0' );

		// Handle common format patterns
		if ( format === 'Y-m-d' || ! format ) {
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

		// Default to Y-m-d
		return `${ year }-${ month }-${ day }`;
	} catch ( error ) {
		console.error( '[Speaking Permalinks] Date formatting error:', error );
		return '';
	}
}

/**
 * Extract raw value from WordPress entity property.
 *
 * @param {*} value The value to extract from.
 * @return {string} The extracted raw value.
 */
export function extractRawValue( value ) {
	if ( ! value ) {
		return '';
	}

	if ( typeof value !== 'object' || value === null ) {
		return String( value );
	}

	if ( value.raw !== undefined ) {
		return value.raw;
	}

	if ( value.rendered !== undefined ) {
		return String( value.rendered ).replace( /<[^>]*>/g, '' );
	}

	return String( value );
}

/**
 * Apply text formatting to a string value.
 *
 * @param {string}      stringValue The string to format.
 * @param {string|null} format      The format type ('lower', 'upper', or null).
 * @return {string} The formatted string.
 */
export function applyTextFormatting( stringValue, format ) {
	if ( ! format ) {
		return stringValue;
	}

	if ( format === 'lower' ) {
		return stringValue.toLowerCase();
	}

	if ( format === 'upper' ) {
		return stringValue.toUpperCase();
	}

	return stringValue;
}

/**
 * Format a value based on the field type and format specification.
 *
 * @param {string}      field  The field name.
 * @param {*}           value  The field value.
 * @param {string|null} format The format specification (e.g., 'Y-m-d', 'lower').
 * @return {string} The formatted value.
 */
export function formatFieldValue( field, value, format ) {
	if ( ! value ) {
		return '';
	}

	// Handle date fields specially
	if ( field === 'date' ) {
		const rawValue = extractRawValue( value );
		return formatDateValue( rawValue, format );
	}

	// For non-date fields, extract raw value and apply text formatting
	const rawValue = extractRawValue( value );
	return applyTextFormatting( rawValue, format );
}
