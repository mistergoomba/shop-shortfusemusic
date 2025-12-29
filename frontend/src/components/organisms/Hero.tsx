import { Link, Stack, TH1, TH2, TP } from '@/src/components/atoms';
import { thv } from '@/src/theme';
import { optimizeImage } from '@/src/util/optimizeImage';
import styled from '@emotion/styled';
import { ArrowRight } from 'lucide-react';

export const Hero: React.FC<{
    h1: string;
    h2: string;
    desc: string;
    cta: string;
    image: string;
    bgImage: string;
    link: string;
}> = ({ cta, desc, h1, h2, image, bgImage, link }) => {
    const optimizedBackground = optimizeImage({
        size: { width: 1280, height: 720, format: 'webp', mode: 'resize' },
        src: bgImage,
    }) as string;

    return (
        <Main column justifyCenter image={optimizedBackground}>
            <Content>
                <TextWrapper column gap="2rem">
                    <Stack column gap="1rem">
                        <Stack column>
                            <TH1 weight={600}>{h1}</TH1>
                            <TH2 weight={400} color="subtitle">
                                {h2}
                            </TH2>
                        </Stack>
                        <TP size="1.75rem" color="subtitle" weight={500}>
                            {desc}
                        </TP>
                    </Stack>
                    <StandAloneLink
                        href={link}
                        {...(link.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                        {cta}
                        <ArrowRight size="2rem" />
                    </StandAloneLink>
                </TextWrapper>
                <HeroImage
                    fetchPriority="high"
                    src={optimizeImage({
                        size: { width: 600, height: 600, format: 'webp', mode: 'resize' },
                        src: image,
                    })}
                    alt="Featured product"
                    title="Featured product"
                />
            </Content>
        </Main>
    );
};

const TextWrapper = styled(Stack)`
    margin-top: 1.5rem;
    @media (min-width: ${p => p.theme.breakpoints.md}) {
        margin-top: 0;
    }
`;

const Content = styled(Stack)`
    width: 100%;
    max-width: 1280px;
    padding: 0;
    flex-direction: column-reverse;

    @media (min-width: ${p => p.theme.breakpoints.md}) {
        margin: 0 auto;
        gap: 4rem;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    @media (max-width: 1560px) {
        max-width: 1440px;
        padding: 0 4rem;
    }
`;

const StandAloneLink = styled(Link)`
    width: fit-content;
    display: flex;
    align-items: center;
    gap: 1rem;

    color: ${thv.text.main};
    font-weight: 600;
    text-transform: uppercase;
`;

const Main = styled(Stack)<{ image: string }>`
    width: 100%;
    padding: 4.5rem 0;
    position: relative;
    z-index: 0;
    overflow: hidden;

    /* Background Image */
    background: ${({ image }) => `url(${image}) center/cover no-repeat`};

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7); /* Adjust darkness here */
        z-index: -1;
    }
`;

const HeroImage = styled.img`
    object-fit: cover;
    width: 100%;
    max-width: 100%;

    @media (min-width: ${p => p.theme.breakpoints.md}) {
        max-width: 32rem;
        max-height: 32rem;
    }

    @media (min-width: ${p => p.theme.breakpoints.lg}) {
        max-width: 36rem;
        max-height: 36rem;
    }
`;
