import styled from '@emotion/styled';
import { InferGetStaticPropsType } from 'next';
import React from 'react';
import { Stack, ContentContainer } from '@/src/components/atoms';
import { HomePageSliders } from '@/src/components/organisms/HomePageSliders';
import { Layout } from '@/src/layouts';
import type { getStaticProps } from './props';
import { CategoryProducts } from '@/src/components/organisms/CategoryProducts';
import { HeroSlider } from '../../organisms/HeroSlider';
import { useTranslation } from 'react-i18next';

const Main = styled(Stack)`
    padding: 0 0 4rem 0;
`;

export const Home: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = props => {
    const { t } = useTranslation('homepage');

    return (
        <Layout navigation={props.navigation} pageTitle={t('seo.home')}>
            <Main w100 column gap="4rem">
                <HeroSlider />
                <CategoryProducts categories={props.categories} />

                <ContentContainer>
                    <HomePageSliders sliders={props.sliders} seeAllText={t('see-all')} />
                </ContentContainer>
            </Main>
        </Layout>
    );
};
