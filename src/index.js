import { registerPlugin } from '@wordpress/plugins';

import { DynamicSlugGenerator } from './components/DynamicSlugGenerator';

/**
 * Register the Speaking Permalinks Plugin
 */
registerPlugin( 'speaking-permalinks', {
	render: DynamicSlugGenerator,
} );
