import { dateI18n } from '@wordpress/date';

/**
 * Check if a value looks like a date that can be formatted.
 *
 * @param {*} value The value to check.
 * @return {boolean} True if the value looks like a date.
 */
function isDateLike( value ) {
	if ( ! value ) {
		return false;
	}

	// Check if it's a string that looks like a date
	if ( typeof value === 'string' ) {
		// ISO 8601 format: YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS
		if ( /^\d{4}-\d{2}-\d{2}/.test( value ) ) {
			return true;
		}
		// Unix timestamp (in seconds or milliseconds)
		if ( /^\d{10,13}$/.test( value ) ) {
			return true;
		}
	}

	// Check if it's a number that could be a Unix timestamp
	if ( typeof value === 'number' ) {
		// Unix timestamps are typically 10 digits (seconds) or 13 digits (milliseconds)
		const valueStr = String( value );
		if ( valueStr.length >= 10 && valueStr.length <= 13 ) {
			return true;
		}
	}

	return false;
}

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
		// eslint-disable-next-line no-console
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
 * Intelligently detects if a format is a date format and applies it accordingly.
 *
 * @param {string}      field  The field name.
 * @param {*}           value  The field value.
 * @param {string|null} format The format specification (e.g., 'Y-m-d', 'lower').
 * @param {boolean}     isMeta Whether this is a meta field.
 * @return {string} The formatted value.
 */
export function formatFieldValue( field, value, format, isMeta = false ) {
	if ( ! value ) {
		return '';
	}

	// Extract raw value first
	const rawValue = extractRawValue( value );

	// Check if we have a format to apply
	if ( ! format ) {
		return rawValue;
	}

	// Detect if the format looks like a date format
	// Common PHP date format characters: Y, m, d, H, i, s, etc.
	const isDateFormat = /[YymdHisaABgGhFjlMnStTwWzZ]/.test( format );

	// If it's explicitly a date field OR the format looks like a date format,
	// try to format as a date
	if ( field === 'date' || ( isMeta && isDateFormat ) ) {
		// For meta fields, check if the value looks like a date
		if ( isMeta && ! isDateLike( rawValue ) ) {
			// Value doesn't look like a date, apply text formatting instead
			return applyTextFormatting( rawValue, format );
		}

		// Try to format as a date
		const formattedDate = formatDateValue( rawValue, format );
		if ( formattedDate ) {
			return formattedDate;
		}
	}

	// For text formatting options (lower, upper)
	return applyTextFormatting( rawValue, format );
}
