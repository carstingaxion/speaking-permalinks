import { useSelect } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';

import { SlugGeneratorCore } from './SlugGeneratorCore';

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
export const DynamicSlugGenerator = () => {
	const { postType, postId, hasSpeakingPermalinksSupport, template } =
		useSelect( ( select ) => {
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
			const postTypeObject =
				select( 'core' ).getPostType( currentPostType );

			// Check if post type supports speaking permalinks
			const supports = postTypeObject?.supports || {};
			const hasSpeakingPermalinks =
				supports[ 'speaking-permalinks' ]?.[ 0 ] || false;

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
		}, [] );

	// Only render if the post type supports speaking permalinks
	if ( ! hasSpeakingPermalinksSupport ) {
		return null;
	}

	// Only render the core component when we have the required data
	if ( ! postType || ! postId || ! template ) {
		return null;
	}

	return (
		<SlugGeneratorCore
			postType={ postType }
			postId={ postId }
			template={ template }
		/>
	);
};
