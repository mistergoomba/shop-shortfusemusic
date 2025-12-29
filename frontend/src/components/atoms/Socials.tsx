import React from 'react';
import { Stack } from './Stack';
import { FaFacebookF, FaInstagram, FaSpotify, FaYoutube, FaApple, FaTiktok } from 'react-icons/fa';
import { Link } from '@/src/components/atoms';
import styled from '@emotion/styled';

const socialHrefs = [
    { href: 'https://www.facebook.com/shortfusemusic', icon: <FaFacebookF size="3rem" />, ariaLabel: 'Facebook' },
    { href: 'https://tiktok.com/@shortfusemusic', icon: <FaTiktok size="3rem" />, ariaLabel: 'Facebook' },
    { href: 'https://www.instagram.com/shortfusemusic/', icon: <FaInstagram size="3rem" />, ariaLabel: 'Instagram' },
    { href: 'https://www.youtube.com/@shortfusemusic', icon: <FaYoutube size="3rem" />, ariaLabel: 'Youtube' },
    {
        href: 'https://open.spotify.com/artist/4hyDbrBttgoruFp4ihTHwR',
        icon: <FaSpotify size="3rem" />,
        ariaLabel: 'Spotify',
    },
    {
        href: 'https://music.apple.com/nz/artist/short-fuse/1656449195',
        icon: <FaApple size="3rem" />,
        ariaLabel: 'Apple Music',
    },
];

export const Socials: React.FC = () => {
    return (
        <Container gap="1rem" justifyEnd>
            {socialHrefs.map(({ href, icon, ariaLabel }) => (
                <StyledLink aria-label={ariaLabel} external key={href} href={href}>
                    {icon}
                </StyledLink>
            ))}
        </Container>
    );
};

const StyledLink = styled(Link)`
    height: max-content;
    color: inherit;
`;

const Container = styled(Stack)`
    color: ${({ theme }) => theme.gray(800)};
    @media (min-width: ${p => p.theme.breakpoints.ssm}) {
        gap: 3.5rem;
    }
`;
