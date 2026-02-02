<?php
/**
 * Plugin Name:       Speaking Permalinks
 * Description:       A plugin that does automatic slug generation from customizable templates using post data, meta fields, and taxonomy terms.
 * Version:           0.1.0
 * Requires at least: 6.1
 * Requires PHP:      7.4
 * Author:            carstenbach
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       speaking-permalinks
 *
 * @package SpeakingPermalinks
 */

namespace SpeakingPermalinks;

defined( 'ABSPATH' ) || exit;

/**
 * Add 'speaking-permalinks' support to the 'post' post type with template configuration.
 * 
 * This enables dynamic slug generation for posts based on customizable templates.
 * The template defines how slugs are automatically generated from post data, meta fields,
 * and taxonomy terms.
 * 
 * Template Variables:
 * 
 * Post Fields (WordPress Core):
 * - {title} - Post title
 * - {date} - Published date (default format)
 * - {date|Y-m-d} - Published date with custom format
 * - {slug} - Current slug
 * - {excerpt} - Post excerpt
 * - {content} - Post content
 * - {author} - Author ID
 * - {status} - Post status
 * - {type} - Post type
 * 
 * Meta Fields (Custom):
 * - {meta:subtitle} - Subtitle meta field
 * - {meta:custom_field} - Any registered meta field
 * 
 * Array Meta Fields:
 * - {meta:custom_field:array_key} - Access specific array element
 * - {meta:address:city} - Get city from address array
 * 
 * Taxonomy Terms:
 * - {tax:category} - Category term slugs (multiple separated by hyphens)
 * - {tax:post_tag} - Tag term slugs
 * - {tax:custom_taxonomy} - Custom taxonomy term slugs
 * 
 * Format Suffixes:
 * - Date formatting: {date|Y-m-d}, {date|Y}, {date|m}, {date|d}
 * - Text formatting: {title|lower}, {title|upper}
 * 
 * To enable this feature for other post types:
 * 
 * add_action( 'init', function() {
 *     add_post_type_support( 'page', 'speaking-permalinks', array(
 *         'template' => '{date|Y-m-d}-{title}'
 *     ) );
 * } );
 *
 * @return void
 */
function add_support(): void {
	add_post_type_support(
		'post',
		'speaking-permalinks',
		array(
			'template' => '{date|Y}-{title}-{tax:category}',
		)
	);
}
add_action( 'init', __NAMESPACE__ . '\add_support' );

/**
 * Enqueue block editor assets for the Speaking Permalinks plugin.
 *
 * This function loads the JavaScript file necessary for the block editor
 * functionality of the Speaking Permalinks plugin.
 *
 * @return void
 */
function enqueue_block_editor_assets(): void {

	$asset_file_path = plugin_dir_path( __FILE__ ) . 'build/index.asset.php';
	if ( ! file_exists( $asset_file_path ) ) {
		return;
	}
	/** 
	 * Safe types coming from the wp-scripts package
	 * 
	 * @var array{version:string, dependencies:array<string>} $asset_file
	 */
	$asset_file = require_once $asset_file_path; // phpcs:ignore WordPressVIPMinimum.Files.IncludingFile.UsingVariable

	wp_enqueue_script(
		'speaking-permalinks-block-editor',
		plugin_dir_url( __FILE__ ) . 'build/index.js',
		$asset_file['dependencies'],
		$asset_file['version'],
		true
	);
}
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\enqueue_block_editor_assets' );
