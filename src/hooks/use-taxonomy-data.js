import { useMemo } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';

/**
 * Custom hook to fetch taxonomy REST bases and term IDs.
 *
 * @param {Array}  taxonomySlugs Array of taxonomy slugs needed.
 * @param {string} postType      Current post type.
 * @param {number} postId        Current post ID.
 * @return {Object} Object containing taxonomyRestBases and taxonomyTermIds.
 */
export function useTaxonomyData( taxonomySlugs, postType, postId ) {
	// Get actual taxonomy REST bases from WordPress
	const taxonomyRestBases = useSelect(
		( select ) => {
			const restBases = {};

			taxonomySlugs.forEach( ( taxonomySlug ) => {
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
		[ taxonomySlugs.join( ',' ) ]
	);

	// Memoize to prevent unnecessary re-renders
	const memoizedRestBases = useMemo(
		() => taxonomyRestBases,
		[ JSON.stringify( taxonomyRestBases ) ]
	);

	// Get actual taxonomy term IDs from WordPress
	const taxonomyTermIdsRaw = useSelect(
		( select ) => {
			const { getEditedPostAttribute } = select( editorStore );
			const ids = {};

			taxonomySlugs.forEach( ( taxonomySlug ) => {
				const restBase =
					memoizedRestBases[ taxonomySlug ] || taxonomySlug;
				try {
					const termIds = getEditedPostAttribute( restBase );
					ids[ taxonomySlug ] = termIds || [];
				} catch ( error ) {
					ids[ taxonomySlug ] = [];
				}
			} );

			return ids;
		},
		[
			taxonomySlugs.join( ',' ),
			JSON.stringify( memoizedRestBases ),
			postType,
			postId,
		]
	);

	// Memoize term IDs
	const taxonomyTermIds = useMemo(
		() => taxonomyTermIdsRaw,
		[ JSON.stringify( taxonomyTermIdsRaw ) ]
	);

	return { taxonomyRestBases: memoizedRestBases, taxonomyTermIds };
}

/**
 * Custom hook to fetch taxonomy term objects and format them as slugs.
 *
 * @param {Array}  taxonomySlugs   Array of taxonomy slugs needed.
 * @param {Object} taxonomyTermIds Object mapping taxonomy slugs to term ID arrays.
 * @return {Object} Object containing formatted taxonomy term slugs.
 */
export function useTaxonomyTerms( taxonomySlugs, taxonomyTermIds ) {
	// Get actual taxonomy terms from WordPress
	const rawTaxonomyTerms = useSelect(
		( select ) => {
			const terms = {};

			taxonomySlugs.forEach( ( taxonomySlug ) => {
				const ids = taxonomyTermIds[ taxonomySlug ];

				if ( ids && ids.length > 0 ) {
					const termObjects = ids
						.map( ( id ) => {
							const term = select( 'core' ).getEntityRecord(
								'taxonomy',
								taxonomySlug,
								id
							);
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
		[ JSON.stringify( taxonomyTermIds ), taxonomySlugs.join( ',' ) ]
	);

	// Memoize the taxonomy terms to prevent unnecessary re-renders
	const taxonomyTerms = useMemo(
		() => rawTaxonomyTerms,
		[ JSON.stringify( rawTaxonomyTerms ) ]
	);

	return taxonomyTerms;
}
