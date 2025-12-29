import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { IconButton } from '@/src/components/molecules/Button';
import { Stack } from '@/src/components/atoms/Stack';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/src/components/atoms/Link';
import { RootNode } from '@/src/util/arrayToTree';
import { NavigationType } from '@/src/graphql/selectors';

interface MobileNavigationProps {
    navigation: RootNode<NavigationType> | null;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ navigation }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <MobileNavContainer>
            <HamburgerButton aria-label="Toggle menu" onClick={toggleMenu}>
                {isOpen ? <X size={64} /> : <Menu size={64} />}
            </HamburgerButton>
            <AnimatePresence>
                {isOpen && (
                    <MenuOverlay
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'tween', duration: 0.2 }}
                    >
                        <MenuContent column gap="2rem">
                            {navigation?.children.map((collection, index) => {
                                const href =
                                    collection.parent?.slug !== '__root_collection__'
                                        ? `/collections/${collection.parent?.slug}/${collection.slug}`
                                        : `/collections/${collection.slug}`;
                                return (
                                    <NavLink key={index} href={href}>
                                        {collection.name}
                                    </NavLink>
                                );
                            })}
                        </MenuContent>
                    </MenuOverlay>
                )}
            </AnimatePresence>
        </MobileNavContainer>
    );
};

const MobileNavContainer = styled.div`
    display: block;
    @media (min-width: ${p => p.theme.breakpoints.md}) {
        display: none;
    }
`;

const HamburgerButton = styled(IconButton)`
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2141;
    color: #fff;
    transition: opacity 0.2s ease;
    width: 40px;
    height: 40px;

    svg {
        width: 100%;
        height: 100%;
    }

    &:hover {
        opacity: 0.7;
    }
`;

const MenuOverlay = styled(motion.div)`
    position: fixed;
    top: 0;
    left: 0;
    width: 80%;
    max-width: 300px;
    height: 100vh;
    background: #000;
    z-index: 2140;
    padding: 2rem;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
`;

const MenuContent = styled(Stack)`
    margin-top: 4rem;
`;

const NavLink = styled(Link)`
    font-size: 2rem;
    color: #fff;
    text-decoration: none;
    padding: 1rem 0;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.05em;

    &:hover {
        color: ${p => p.theme.gray(400)};
    }
`;
