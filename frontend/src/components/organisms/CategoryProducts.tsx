import React from 'react';
import { Stack, ContentContainer } from '@/src/components/atoms';
import { LightTheme } from '@/src/theme';
import Link from 'next/link';
import styled from '@emotion/styled';

type Category = {
    id: string;
    name: string;
    featuredAsset?: { preview?: string };
    productVariants?: {
        items: {
            id: string;
            name: string;
            priceWithTax: number;
            currencyCode: string;
            stockLevel: string;
            featuredAsset?: { preview?: string };
            product: {
                featuredAsset?: { preview?: string };
            };
        }[];
    };
};

type VariantType = {
    id: string;
    name: string;
    priceWithTax: number;
    currencyCode: string;
    stockLevel: string;
    featuredAsset?: { preview?: string };
    product: {
        id?: string;
        slug?: string;
        name?: string;
        featuredAsset?: { preview?: string };
    };
};

const ProductLink = styled(Link)`
    text-decoration: none;
    color: inherit;
    display: block;
    width: 100%;
    transition: transform 0.2s cubic-bezier(0.4, 2, 0.6, 1);
    padding-bottom: 2rem;

    @media (min-width: ${p => p.theme.breakpoints.md}) {
        max-width: 200px;
        padding-bottom: 0;
    }
`;

const ProductTitle = styled.h3`
    font-size: 2rem;
    margin: 1rem 0;
    color: ${LightTheme.text.main};

    @media (min-width: ${p => p.theme.breakpoints.md}) {
        font-size: 1.4rem;
        margin: 0.5rem 0;
        min-height: 3em;
    }
`;

const ProductPrice = styled.p`
    margin: 0;
    color: ${LightTheme.price.default};
    font-weight: 700;
    font-size: 1.8rem;
    letter-spacing: 0.5px;

    @media (min-width: ${p => p.theme.breakpoints.md}) {
        font-size: 1.15rem;
    }
`;

const CategoryTitle = styled.h2`
    font-size: 4rem;
    margin-bottom: 2rem;
    color: ${LightTheme.text.main};
    text-transform: uppercase;

    @media (min-width: ${p => p.theme.breakpoints.md}) {
        font-size: 3rem;
        margin-bottom: 1rem;
    }
`;

const CategoryProductVariantList: React.FC<{
    variants: VariantType[];
}> = ({ variants }) => {
    const productMap = new Map<
        string,
        {
            product: VariantType['product'];
            variants: VariantType[];
            allOutOfStock: boolean;
            prices: number[];
            currency: string;
        }
    >();

    variants.forEach(variant => {
        const productId = variant.product.id || variant.product.slug || variant.name;
        if (!productMap.has(productId)) {
            productMap.set(productId, {
                product: variant.product,
                variants: [variant],
                allOutOfStock: variant.stockLevel === 'OUT_OF_STOCK',
                prices: [variant.priceWithTax],
                currency: variant.currencyCode,
            });
        } else {
            const entry = productMap.get(productId)!;
            entry.variants.push(variant);
            entry.prices.push(variant.priceWithTax);
            if (variant.stockLevel !== 'OUT_OF_STOCK') {
                entry.allOutOfStock = false;
            }
        }
    });

    const products = Array.from(productMap.values()).map(entry => {
        const minPrice = Math.min(...entry.prices);
        const maxPrice = Math.max(...entry.prices);
        return {
            ...entry,
            minPrice,
            maxPrice,
            priceDisplay:
                minPrice === maxPrice
                    ? `$${(minPrice / 100).toFixed(2)} ${entry.currency}`
                    : `$${(minPrice / 100).toFixed(2)} - $${(maxPrice / 100).toFixed(2)} ${entry.currency}`,
        };
    });

    return (
        <Stack gap="2rem" flexWrap>
            {products.map(productEntry => {
                const firstVariant = productEntry.variants[0];
                const slug = productEntry.product.slug;
                return (
                    <ProductLink key={firstVariant.id} href={`/products/${slug}`} passHref>
                        <div
                            style={{
                                position: 'relative',
                                width: '100%',
                                borderRadius: '8px',
                                transition: 'transform 0.2s cubic-bezier(.4,2,.6,1)',
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
                            }}>
                            <img
                                src={firstVariant.product.featuredAsset?.preview || '/placeholder.png'}
                                alt={firstVariant.name}
                                style={{ width: '100%', borderRadius: '8px' }}
                            />
                            {productEntry.allOutOfStock && (
                                <span
                                    style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        background: '#bfff00',
                                        color: '#111',
                                        fontWeight: 700,
                                        borderRadius: '50%',
                                        padding: '1.25rem 1.5rem',
                                        fontSize: '1.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                        zIndex: 2,
                                        width: '50px',
                                        height: '50px',
                                    }}>
                                    SOLD OUT
                                </span>
                            )}
                            <ProductTitle>{firstVariant.name}</ProductTitle>
                            <ProductPrice>{productEntry.priceDisplay}</ProductPrice>
                        </div>
                    </ProductLink>
                );
            })}
        </Stack>
    );
};

export const CategoryProducts: React.FC<{ categories: Category[] }> = ({ categories }) => (
    <ContentContainer>
        <Stack column gap="4rem">
            {categories
                ?.filter(
                    category =>
                        category.productVariants &&
                        category.productVariants.items &&
                        category.productVariants.items.length > 0,
                )
                .map(category => (
                    <div key={category.id}>
                        <CategoryTitle>{category.name}</CategoryTitle>
                        <CategoryProductVariantList variants={category.productVariants!.items} />
                    </div>
                ))}
        </Stack>
    </ContentContainer>
);
