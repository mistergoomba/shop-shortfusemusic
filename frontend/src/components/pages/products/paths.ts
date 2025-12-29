import { SSGQuery } from '@/src/graphql/client';
import { ProductSlugSelector } from '@/src/graphql/selectors';
import { DEFAULT_CHANNEL, channels } from '@/src/lib/consts';
import { getAllPossibleWithChannels } from '@/src/lib/getStatic';

export const getStaticPaths = async () => {
    const allPaths = getAllPossibleWithChannels();
    const resp = await Promise.all(
        allPaths.map(async path => {
            const channel = channels.find(c => c.slug === path.params.channel)?.channel ?? DEFAULT_CHANNEL;
            const { products } = await SSGQuery({ channel, locale: path.params.locale })({
                products: [{}, { items: ProductSlugSelector }],
            });
            return { ...products, ...path.params };
        }),
    );
    const paths = resp.flatMap(data =>
        data.items.map(item => {
            return { params: { ...data, slug: item.slug } };
        }),
    );

    try {
        return { paths, fallback: 'blocking' };
    } catch (error) {
        // If backend is not available during build, return empty paths
        // Pages will be generated on-demand when first requested
        console.warn('Failed to fetch products paths during build, using on-demand generation:', error);
        return { paths: [], fallback: 'blocking' };
    }
};
