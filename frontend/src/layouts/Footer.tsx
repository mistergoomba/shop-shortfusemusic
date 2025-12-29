import styled from '@emotion/styled';
import { useTranslation } from 'next-i18next';

import { Stack, TypoGraphy, Link, ContentContainer } from '@/src/components/atoms';
import { Socials } from '@/src/components/atoms/Socials';
import { NavigationType } from '@/src/graphql/selectors';
import { RootNode } from '@/src/util/arrayToTree';

export const Footer: React.FC<{
    navigation: RootNode<NavigationType> | null;
}> = ({ navigation }) => {
    const { t } = useTranslation('common');

    const footerLaw = t('footer.law', { returnObjects: true });

    return (
        <Wrapper>
            <Main>
                <ContentContainer>
                    <Container column justifyBetween>
                        <FooterSections justifyBetween>
                            {navigation?.children
                                .filter(c => c.slug !== 'all' && c.slug !== 'search')
                                .map(section => {
                                    const href =
                                        section.parent?.slug !== '__root_collection__'
                                            ? `/collections/${section.parent?.slug}/${section.slug}`
                                            : `/collections/${section.slug}`;
                                    return (
                                        <Stack key={section.name} column>
                                            <TypoGraphy as="h3" size="1.5rem" weight={600}>
                                                {section.name}
                                            </TypoGraphy>
                                            <Stack column gap="2rem">
                                                {section.children.map(link => (
                                                    <Link key={link.slug} href={href}>
                                                        {link.name}
                                                    </Link>
                                                ))}
                                            </Stack>
                                        </Stack>
                                    );
                                })}
                        </FooterSections>
                    </Container>
                </ContentContainer>
            </Main>
            <LawsWrapper>
                <ContentContainer>
                    <Stack justifyBetween itemsCenter>
                        <Laws>
                            {footerLaw?.map(l => (
                                <Link key={l.name} href={l.href}>
                                    {l.name}
                                </Link>
                            ))}
                        </Laws>
                        <Socials />
                    </Stack>
                </ContentContainer>
            </LawsWrapper>
            <LinkBar>
                <Link href="https://shortfusemusic.com/" external>
                    <p>
                        Back to <strong>Short Fuse Home Page</strong>
                    </p>
                </Link>
            </LinkBar>
        </Wrapper>
    );
};

const Wrapper = styled.footer`
    h2,
    p {
        width: max-content;
        line-height: 3.5rem;
    }
    h3 {
        text-transform: uppercase;
    }
    a {
        text-transform: capitalize;
        color: ${({ theme }) => theme.text.main};
        transform: opacity 0.25s ease-in-out;
        &:hover {
            opacity: 0.7;
        }
    }
`;
const Main = styled(Stack)`
    gap: 5rem;
    background-color: ${({ theme }) => theme.background.secondary};
`;

const Container = styled(Stack)`
    gap: 2rem;
    padding: 3rem 0;
    max-width: 900px;
    width: 100%;
    margin: 0 auto;
`;
const FooterSections = styled(Stack)`
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;

    > div {
        width: 100%;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    @media (min-width: ${p => p.theme.breakpoints.ssm}) {
        display: flex;
        justify-content: space-between;
        width: 100%;
        > div {
            width: max-content;
            flex: 1;
            text-align: center;
        }
    }
    @media (min-width: ${p => p.theme.breakpoints['2xl']}) {
        gap: 4rem;
    }
`;
const LawsWrapper = styled(Stack)`
    background: ${({ theme }) => theme.background.third};
    padding: 3rem 0;
`;

const Laws = styled(Stack)`
    gap: 1.5rem;
    @media (min-width: ${p => p.theme.breakpoints.ssm}) {
        gap: 5rem;
    }
`;
const LinkBar = styled.div`
    width: 100%;
    height: fit-content;
    background-color: ${({ theme }) => theme.background.third};
    display: flex;
    justify-content: center;
    user-select: none;
    & p {
        font-size: 1rem;
    }
    & strong {
        text-transform: uppercase;
        font-weight: 900;
        color: gray;
    }
`;
