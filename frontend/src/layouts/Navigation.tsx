import { LogoAexol } from '@/src/assets';
import { ContentContainer } from '@/src/components/atoms';
import { UserMenu } from '@/src/components/molecules/UserMenu';

import { Stack } from '@/src/components/atoms/Stack';
import styled from '@emotion/styled';
import { Link } from '@/src/components/atoms/Link';
import { useCart } from '@/src/state/cart';

// import { Cart } from '@/src/layouts/Cart';
// import { LanguageSwitcher } from '@/src/components';

import { CartDrawer } from '@/src/layouts/CartDrawer';
import { NavigationType } from '@/src/graphql/selectors';
import { RootNode } from '@/src/util/arrayToTree';
import { DesktopNavigation } from '@/src/components/organisms/DesktopNavigation';
import { SearchIcon } from 'lucide-react';
import { IconButton } from '@/src/components/molecules/Button';
import { NavigationSearch } from '@/src/components/organisms/NavgationSearch';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigationSearch } from '@/src/components/organisms/NavgationSearch/hooks';
import { useEffect, useRef } from 'react';
import { Picker } from '@/src/components/organisms/Picker';
import { MobileNavigation } from '@/src/components/organisms/MobileNavigation';

interface NavigationProps {
    navigation: RootNode<NavigationType> | null;
    changeModal?: {
        modal: boolean;
        channel: string;
        locale: string;
        country_name: string;
    };
}

export const Navigation: React.FC<NavigationProps> = ({ navigation, changeModal }) => {
    const { isLogged, cart } = useCart();
    const navigationSearch = useNavigationSearch();
    const searchRef = useRef<HTMLDivElement>(null);
    const searchMobileRef = useRef<HTMLDivElement>(null);
    const iconRef = useRef<HTMLButtonElement>(null);

    const handleOutsideClick = (event: MouseEvent) => {
        if (
            searchRef.current &&
            !searchRef.current.contains(event.target as Node) &&
            iconRef.current &&
            !iconRef.current.contains(event.target as Node) &&
            searchMobileRef.current &&
            !searchMobileRef.current.contains(event.target as Node)
        ) {
            navigationSearch.closeSearch();
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleOutsideClick);
        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, []);

    return (
        <StickyContainer>
            <ContentContainer>
                <Stack itemsCenter justifyBetween gap="5rem" w100>
                    <Stack itemsCenter justifyCenter>
                        <MobileNavigation navigation={navigation} />
                        <Link ariaLabel={'Home'} href={'/'}>
                            <LogoAexol width={100} />
                        </Link>
                    </Stack>
                    <AnimatePresence>
                        {navigationSearch.searchOpen ? (
                            <DesktopNavigationContainer
                                style={{ width: '100%' }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                ref={searchRef}
                            >
                                <NavigationSearch {...navigationSearch} />
                            </DesktopNavigationContainer>
                        ) : (
                            <DesktopNavigation navigation={navigation} />
                        )}
                    </AnimatePresence>
                    <IconContainer gap="1rem" itemsCenter>
                        <IconButton aria-label="Search products" onClick={navigationSearch.toggleSearch} ref={iconRef}>
                            <SearchIcon />
                        </IconButton>
                        <Picker changeModal={changeModal} />
                        <UserMenu isLogged={isLogged} />
                        <CartDrawer activeOrder={cart} />
                    </IconContainer>
                </Stack>
            </ContentContainer>
        </StickyContainer>
    );
};

const IconContainer = styled(Stack)`
    @media (max-width: ${p => p.theme.breakpoints.md}) {
        button {
            width: 40px;
            height: 40px;

            svg {
                width: 100%;
                height: 100%;
            }
        }
    }
`;

const StickyContainer = styled.nav`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    width: 100%;
    padding: 0.5rem 2rem;
    position: sticky;
    top: 0;
    background: #000;
    z-index: 2137;
    border-bottom: 1px solid ${p => p.theme.gray(100)};
    svg {
        max-height: 4rem;
    }
`;

const DesktopNavigationContainer = styled(motion.div)`
    display: none;
    font-size: 3rem;
    background: '#0f0';

    @media (min-width: ${p => p.theme.breakpoints.md}) {
        display: block;
    }
`;
