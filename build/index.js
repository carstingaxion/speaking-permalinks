/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/components/DynamicSlugGenerator.js"
/*!************************************************!*\
  !*** ./src/components/DynamicSlugGenerator.js ***!
  \************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DynamicSlugGenerator: () => (/* binding */ DynamicSlugGenerator)
/* harmony export */ });
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_editor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/editor */ "@wordpress/editor");
/* harmony import */ var _wordpress_editor__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_editor__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _SlugGeneratorCore__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./SlugGeneratorCore */ "./src/components/SlugGeneratorCore.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__);




/**
 * Dynamic Slug Generator Plugin
 *
 * This plugin monitors post data changes and automatically generates slugs
 * based on the template defined in post type support configuration.
 *
 * Only renders when the current post type supports 'speaking-permalinks'.
 *
 * @return {Element|null} The SlugGeneratorCore component or null.
 */

const DynamicSlugGenerator = () => {
  const {
    postType,
    postId,
    hasSpeakingPermalinksSupport,
    template
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.useSelect)(select => {
    const editor = select(_wordpress_editor__WEBPACK_IMPORTED_MODULE_1__.store);
    if (!editor) {
      return {
        postType: null,
        postId: null,
        hasSpeakingPermalinksSupport: false,
        template: ''
      };
    }
    const currentPostType = editor.getCurrentPostType();
    const postTypeObject = select('core').getPostType(currentPostType);

    // Check if post type supports speaking permalinks
    const supports = postTypeObject?.supports || {};
    const hasSpeakingPermalinks = supports['speaking-permalinks']?.[0] || false;

    // Get the template from post type support config
    let templateValue = '';
    if (hasSpeakingPermalinks) {
      templateValue = hasSpeakingPermalinks.template;
    }
    return {
      postType: currentPostType,
      postId: editor.getCurrentPostId(),
      hasSpeakingPermalinksSupport: hasSpeakingPermalinks,
      template: templateValue
    };
  }, []);

  // Only render if the post type supports speaking permalinks
  if (!hasSpeakingPermalinksSupport) {
    return null;
  }

  // Only render the core component when we have the required data
  if (!postType || !postId || !template) {
    return null;
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_SlugGeneratorCore__WEBPACK_IMPORTED_MODULE_2__.SlugGeneratorCore, {
    postType: postType,
    postId: postId,
    template: template
  });
};

/***/ },

/***/ "./src/components/SlugGeneratorCore.js"
/*!*********************************************!*\
  !*** ./src/components/SlugGeneratorCore.js ***!
  \*********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SlugGeneratorCore: () => (/* binding */ SlugGeneratorCore)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_core_data__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/core-data */ "@wordpress/core-data");
/* harmony import */ var _wordpress_core_data__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_core_data__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_editor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/editor */ "@wordpress/editor");
/* harmony import */ var _wordpress_editor__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_editor__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _utils_template_parser__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/template-parser */ "./src/utils/template-parser.js");
/* harmony import */ var _utils_slug_generator__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/slug-generator */ "./src/utils/slug-generator.js");
/* harmony import */ var _hooks_use_taxonomy_data__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../hooks/use-taxonomy-data */ "./src/hooks/use-taxonomy-data.js");








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
const SlugGeneratorCore = ({
  postType,
  postId,
  template
}) => {
  // Parse template to get all variables
  const variables = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_utils_template_parser__WEBPACK_IMPORTED_MODULE_4__.parseTemplateVariables)(template), [template]);

  // Extract required fields from variables
  const {
    postFields: postFieldsNeeded,
    metaFields: metaFieldsNeeded,
    taxonomySlugs: taxonomySlugsNeeded
  } = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_utils_template_parser__WEBPACK_IMPORTED_MODULE_4__.extractRequiredFields)(variables), [variables]);

  // Get all post data in one useSelect call
  const postFieldValues = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    const {
      getEditedPostAttribute
    } = select(_wordpress_editor__WEBPACK_IMPORTED_MODULE_3__.store);
    const values = {};
    postFieldsNeeded.forEach(field => {
      try {
        values[field] = getEditedPostAttribute(field);
      } catch (error) {
        values[field] = '';
      }
    });
    return values;
  }, [postFieldsNeeded.join(','), postType, postId]);

  // Get meta fields
  const [meta] = (0,_wordpress_core_data__WEBPACK_IMPORTED_MODULE_2__.useEntityProp)('postType', postType, 'meta', postId);

  // Get taxonomy data using custom hooks
  const {
    taxonomyRestBases,
    taxonomyTermIds
  } = (0,_hooks_use_taxonomy_data__WEBPACK_IMPORTED_MODULE_6__.useTaxonomyData)(taxonomySlugsNeeded, postType, postId);
  const taxonomyTerms = (0,_hooks_use_taxonomy_data__WEBPACK_IMPORTED_MODULE_6__.useTaxonomyTerms)(taxonomySlugsNeeded, taxonomyTermIds);

  // Get the current slug for comparison
  const [currentSlug, setPostSlug] = (0,_wordpress_core_data__WEBPACK_IMPORTED_MODULE_2__.useEntityProp)('postType', postType, 'slug', postId);
  const lastGeneratedSlug = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)('');
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    // Only generate slug if we have the necessary data
    if (!postId || !template) {
      return;
    }

    // Check if template is just the default
    if (template === '{title}') {
      return;
    }

    // Debounce slug generation
    const timeoutId = setTimeout(() => {
      const generatedSlug = (0,_utils_slug_generator__WEBPACK_IMPORTED_MODULE_5__.generateSlugFromTemplate)(template, variables, postFieldValues, meta || {}, taxonomyTerms || {});

      // Only update if the slug has changed and it's different from what we last generated
      if (generatedSlug && generatedSlug !== currentSlug && generatedSlug !== lastGeneratedSlug.current) {
        lastGeneratedSlug.current = generatedSlug;
        setPostSlug(generatedSlug);
      }
    }, 200);
    return () => clearTimeout(timeoutId);
  }, [postId, template, JSON.stringify(postFieldValues), JSON.stringify(meta), JSON.stringify(taxonomyTermIds), JSON.stringify(taxonomyTerms), currentSlug, setPostSlug, variables]);
  return null;
};

/***/ },

/***/ "./src/hooks/use-taxonomy-data.js"
/*!****************************************!*\
  !*** ./src/hooks/use-taxonomy-data.js ***!
  \****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useTaxonomyData: () => (/* binding */ useTaxonomyData),
/* harmony export */   useTaxonomyTerms: () => (/* binding */ useTaxonomyTerms)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_editor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/editor */ "@wordpress/editor");
/* harmony import */ var _wordpress_editor__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_editor__WEBPACK_IMPORTED_MODULE_2__);




/**
 * Custom hook to fetch taxonomy REST bases and term IDs.
 *
 * @param {Array}  taxonomySlugs Array of taxonomy slugs needed.
 * @param {string} postType      Current post type.
 * @param {number} postId        Current post ID.
 * @return {Object} Object containing taxonomyRestBases and taxonomyTermIds.
 */
function useTaxonomyData(taxonomySlugs, postType, postId) {
  // Get actual taxonomy REST bases from WordPress
  const taxonomyRestBases = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    const restBases = {};
    taxonomySlugs.forEach(taxonomySlug => {
      const taxonomy = select('core').getTaxonomy(taxonomySlug);
      if (taxonomy) {
        const restBase = taxonomy.rest_base || taxonomySlug;
        restBases[taxonomySlug] = restBase;
      } else {
        restBases[taxonomySlug] = taxonomySlug;
      }
    });
    return restBases;
  }, [taxonomySlugs.join(',')]);

  // Memoize to prevent unnecessary re-renders
  const memoizedRestBases = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => taxonomyRestBases, [JSON.stringify(taxonomyRestBases)]);

  // Get actual taxonomy term IDs from WordPress
  const taxonomyTermIdsRaw = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    const {
      getEditedPostAttribute
    } = select(_wordpress_editor__WEBPACK_IMPORTED_MODULE_2__.store);
    const ids = {};
    taxonomySlugs.forEach(taxonomySlug => {
      const restBase = memoizedRestBases[taxonomySlug] || taxonomySlug;
      try {
        const termIds = getEditedPostAttribute(restBase);
        ids[taxonomySlug] = termIds || [];
      } catch (error) {
        ids[taxonomySlug] = [];
      }
    });
    return ids;
  }, [taxonomySlugs.join(','), JSON.stringify(memoizedRestBases), postType, postId]);

  // Memoize term IDs
  const taxonomyTermIds = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => taxonomyTermIdsRaw, [JSON.stringify(taxonomyTermIdsRaw)]);
  return {
    taxonomyRestBases: memoizedRestBases,
    taxonomyTermIds
  };
}

/**
 * Custom hook to fetch taxonomy term objects and format them as slugs.
 *
 * @param {Array}  taxonomySlugs   Array of taxonomy slugs needed.
 * @param {Object} taxonomyTermIds Object mapping taxonomy slugs to term ID arrays.
 * @return {Object} Object containing formatted taxonomy term slugs.
 */
function useTaxonomyTerms(taxonomySlugs, taxonomyTermIds) {
  // Get actual taxonomy terms from WordPress
  const rawTaxonomyTerms = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    const terms = {};
    taxonomySlugs.forEach(taxonomySlug => {
      const ids = taxonomyTermIds[taxonomySlug];
      if (ids && ids.length > 0) {
        const termObjects = ids.map(id => {
          const term = select('core').getEntityRecord('taxonomy', taxonomySlug, id);
          return term;
        }).filter(Boolean);
        if (termObjects.length > 0) {
          const slugs = termObjects.map(term => term.slug);
          terms[taxonomySlug] = slugs.join('-');
        }
      }
    });
    return terms;
  }, [JSON.stringify(taxonomyTermIds), taxonomySlugs.join(',')]);

  // Memoize the taxonomy terms to prevent unnecessary re-renders
  const taxonomyTerms = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => rawTaxonomyTerms, [JSON.stringify(rawTaxonomyTerms)]);
  return taxonomyTerms;
}

/***/ },

/***/ "./src/utils/slug-generator.js"
/*!*************************************!*\
  !*** ./src/utils/slug-generator.js ***!
  \*************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   generateSlugFromTemplate: () => (/* binding */ generateSlugFromTemplate),
/* harmony export */   sanitizeSlug: () => (/* binding */ sanitizeSlug)
/* harmony export */ });
/* harmony import */ var _value_formatter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./value-formatter.js */ "./src/utils/value-formatter.js");


/**
 * Sanitize a slug string according to WordPress standards.
 *
 * @param {string} slug The slug to sanitize.
 * @return {string} The sanitized slug.
 */
function sanitizeSlug(slug) {
  // Remove empty segments
  const slugParts = slug.split('-').filter(part => part.trim() !== '');
  slug = slugParts.join('-');

  // Sanitize: lowercase, remove non-alphanumeric except hyphens, collapse multiple hyphens
  slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
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
function generateSlugFromTemplate(template, variables, postFields, meta, taxonomyTerms) {
  if (!template) {
    return '';
  }

  // Replace each variable in the template
  const slug = template.replace(/\{([^}]+)\}/g, (match, variable) => {
    // Find the matching variable object
    const varObj = variables.find(v => v.raw === variable);
    if (!varObj) {
      return '';
    }
    if (varObj.isTax) {
      // Get taxonomy terms
      const value = taxonomyTerms && taxonomyTerms[varObj.field] ? taxonomyTerms[varObj.field] : '';
      return value;
    }
    if (varObj.isMeta) {
      // Get meta field value
      let value = meta && meta[varObj.field] !== undefined ? meta[varObj.field] : '';

      // Handle array access if arrayKey is specified
      if (varObj.arrayKey && value) {
        // Check if value is an array or object
        if (typeof value === 'object' && value !== null) {
          value = value[varObj.arrayKey];

          // If still undefined or null after accessing array key, return empty
          if (value === undefined || value === null) {
            return '';
          }
        } else {
          // Value is not an array/object, can't access array key
          return '';
        }
      }
      const formatted = (0,_value_formatter_js__WEBPACK_IMPORTED_MODULE_0__.formatFieldValue)(varObj.field, value, varObj.format);
      return formatted;
    }

    // Get post field value
    const value = postFields[varObj.field];
    const formatted = (0,_value_formatter_js__WEBPACK_IMPORTED_MODULE_0__.formatFieldValue)(varObj.field, value, varObj.format);
    return formatted;
  });
  return sanitizeSlug(slug);
}

/***/ },

/***/ "./src/utils/template-parser.js"
/*!**************************************!*\
  !*** ./src/utils/template-parser.js ***!
  \**************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   extractRequiredFields: () => (/* binding */ extractRequiredFields),
/* harmony export */   parseTemplateVariables: () => (/* binding */ parseTemplateVariables)
/* harmony export */ });
/**
 * Parse template and extract all variables with their formatting options.
 *
 * @param {string} template The slug template.
 * @return {Array} Array of variable objects with field, arrayKey, format, isMeta, and isTax properties.
 */
function parseTemplateVariables(template) {
  if (!template) {
    return [];
  }
  const variables = [];
  const regex = /\{([^}]+)\}/g;
  let match;
  while ((match = regex.exec(template)) !== null) {
    const variable = match[1];

    // Check if it's a meta field or taxonomy
    const isMeta = variable.startsWith('meta:');
    const isTax = variable.startsWith('tax:');

    // Remove prefix if present
    const withoutPrefix = isMeta ? variable.substring(5) : isTax ? variable.substring(4) : variable;

    // Split by | to get field and format (format comes last)
    const parts = withoutPrefix.split('|');
    const format = parts.length > 1 ? parts[parts.length - 1] : null;

    // The field part may contain array access notation (field:array_key)
    const fieldPart = parts[0];
    const fieldParts = fieldPart.split(':');
    const field = fieldParts[0];
    const arrayKey = fieldParts.length > 1 ? fieldParts[1] : null;
    variables.push({
      field,
      arrayKey,
      format,
      isMeta,
      isTax,
      raw: variable
    });
  }
  return variables;
}

/**
 * Extract unique fields needed from parsed variables.
 *
 * @param {Array} variables Parsed template variables.
 * @return {Object} Object containing postFields, metaFields, and taxonomySlugs arrays.
 */
function extractRequiredFields(variables) {
  const postFields = [...new Set(variables.filter(v => !v.isMeta && !v.isTax).map(v => v.field))];
  const metaFields = [...new Set(variables.filter(v => v.isMeta).map(v => v.field))];
  const taxonomySlugs = [...new Set(variables.filter(v => v.isTax).map(v => v.field))];
  return {
    postFields,
    metaFields,
    taxonomySlugs
  };
}

/***/ },

/***/ "./src/utils/value-formatter.js"
/*!**************************************!*\
  !*** ./src/utils/value-formatter.js ***!
  \**************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   applyTextFormatting: () => (/* binding */ applyTextFormatting),
/* harmony export */   extractRawValue: () => (/* binding */ extractRawValue),
/* harmony export */   formatDateValue: () => (/* binding */ formatDateValue),
/* harmony export */   formatFieldValue: () => (/* binding */ formatFieldValue)
/* harmony export */ });
/* harmony import */ var _wordpress_date__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/date */ "@wordpress/date");
/* harmony import */ var _wordpress_date__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_date__WEBPACK_IMPORTED_MODULE_0__);


/**
 * Format a date value with the specified PHP date format.
 *
 * @param {string} rawValue The raw date value.
 * @param {string} format   The PHP date format string.
 * @return {string} The formatted date string.
 */
function formatDateValue(rawValue, format) {
  if (!rawValue) {
    return '';
  }

  // Try using WordPress's dateI18n first
  if (format) {
    try {
      return (0,_wordpress_date__WEBPACK_IMPORTED_MODULE_0__.dateI18n)(format, rawValue);
    } catch (error) {
      // Fallback to manual formatting
    }
  }

  // Manual date formatting fallback
  try {
    const date = new Date(rawValue);
    if (isNaN(date.getTime())) {
      return '';
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Handle common format patterns
    if (format === 'Y-m-d' || !format) {
      return `${year}-${month}-${day}`;
    }
    if (format === 'Y') {
      return String(year);
    }
    if (format === 'm') {
      return month;
    }
    if (format === 'd') {
      return day;
    }

    // Default to Y-m-d
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('[Speaking Permalinks] Date formatting error:', error);
    return '';
  }
}

/**
 * Extract raw value from WordPress entity property.
 *
 * @param {*} value The value to extract from.
 * @return {string} The extracted raw value.
 */
function extractRawValue(value) {
  if (!value) {
    return '';
  }
  if (typeof value !== 'object' || value === null) {
    return String(value);
  }
  if (value.raw !== undefined) {
    return value.raw;
  }
  if (value.rendered !== undefined) {
    return String(value.rendered).replace(/<[^>]*>/g, '');
  }
  return String(value);
}

/**
 * Apply text formatting to a string value.
 *
 * @param {string}      stringValue The string to format.
 * @param {string|null} format      The format type ('lower', 'upper', or null).
 * @return {string} The formatted string.
 */
function applyTextFormatting(stringValue, format) {
  if (!format) {
    return stringValue;
  }
  if (format === 'lower') {
    return stringValue.toLowerCase();
  }
  if (format === 'upper') {
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
function formatFieldValue(field, value, format) {
  if (!value) {
    return '';
  }

  // Handle date fields specially
  if (field === 'date') {
    const rawValue = extractRawValue(value);
    return formatDateValue(rawValue, format);
  }

  // For non-date fields, extract raw value and apply text formatting
  const rawValue = extractRawValue(value);
  return applyTextFormatting(rawValue, format);
}

/***/ },

/***/ "@wordpress/core-data"
/*!**********************************!*\
  !*** external ["wp","coreData"] ***!
  \**********************************/
(module) {

module.exports = window["wp"]["coreData"];

/***/ },

/***/ "@wordpress/data"
/*!******************************!*\
  !*** external ["wp","data"] ***!
  \******************************/
(module) {

module.exports = window["wp"]["data"];

/***/ },

/***/ "@wordpress/date"
/*!******************************!*\
  !*** external ["wp","date"] ***!
  \******************************/
(module) {

module.exports = window["wp"]["date"];

/***/ },

/***/ "@wordpress/editor"
/*!********************************!*\
  !*** external ["wp","editor"] ***!
  \********************************/
(module) {

module.exports = window["wp"]["editor"];

/***/ },

/***/ "@wordpress/element"
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
(module) {

module.exports = window["wp"]["element"];

/***/ },

/***/ "@wordpress/plugins"
/*!*********************************!*\
  !*** external ["wp","plugins"] ***!
  \*********************************/
(module) {

module.exports = window["wp"]["plugins"];

/***/ },

/***/ "react/jsx-runtime"
/*!**********************************!*\
  !*** external "ReactJSXRuntime" ***!
  \**********************************/
(module) {

module.exports = window["ReactJSXRuntime"];

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Check if module exists (development only)
/******/ 		if (__webpack_modules__[moduleId] === undefined) {
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_plugins__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/plugins */ "@wordpress/plugins");
/* harmony import */ var _wordpress_plugins__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_plugins__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_DynamicSlugGenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components/DynamicSlugGenerator */ "./src/components/DynamicSlugGenerator.js");



/**
 * Register the Speaking Permalinks Plugin
 */
(0,_wordpress_plugins__WEBPACK_IMPORTED_MODULE_0__.registerPlugin)('speaking-permalinks', {
  render: _components_DynamicSlugGenerator__WEBPACK_IMPORTED_MODULE_1__.DynamicSlugGenerator
});
})();

/******/ })()
;
//# sourceMappingURL=index.js.map