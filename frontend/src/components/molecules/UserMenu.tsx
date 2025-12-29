import { Dropdown } from '@/src/styles/reusableStyles';
import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { Link } from '@/src/components/atoms';
import { User2, UserCheck2 } from 'lucide-react';

interface UserMenuProps {
    isLogged: boolean;
}

export const UserMenu: React.FC<UserMenuProps> = ({ isLogged }) => {
    return (
        <Dropdown>
            <IconLink aria-label="User menu" href={isLogged ? '/customer/manage' : '/customer/sign-in'}>
                <AnimatePresence>
                    {isLogged ? (
                        <IconWrapper initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <UserCheck2 className="user-icon" />
                        </IconWrapper>
                    ) : (
                        <IconWrapper initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <User2 className="user-icon" />
                        </IconWrapper>
                    )}
                </AnimatePresence>
            </IconLink>
        </Dropdown>
    );
};

const IconWrapper = styled(motion.div)`
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    .user-icon {
        width: 3.5rem;
        height: 3.5rem;

        @media (min-width: ${p => p.theme.breakpoints.md}) {
            width: 2.5rem;
            height: 2.5rem;
        }
    }
`;

const IconLink = styled(Link)`
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${p => p.theme.text.main};
`;
