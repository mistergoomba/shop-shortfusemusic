import React from 'react';
import { Stack } from '@/src/components/atoms';
import styled from '@emotion/styled';

export const ProductDescription: React.FC<{
    data: { children: React.ReactNode }[];
}> = ({ data }) => {
    return (
        <Stack w100 column gap="2rem" style={{ marginTop: '3.5rem' }}>
            {data.map((entry, index) => (
                <GridWrapper key={index} w100 column>
                    <Grid>
                        <GridEntry>{entry.children}</GridEntry>
                    </Grid>
                    <Line />
                </GridWrapper>
            ))}
        </Stack>
    );
};

const Line = styled.div`
    width: 100%;
    height: 1px;
    background-color: ${({ theme }) => theme.gray(100)};
    margin-top: 2rem;
`;

const GridWrapper = styled(Stack)``;

const Grid = styled.div`
    display: grid;
    grid-template-rows: 1fr;
`;

const GridEntry = styled(Stack)`
    overflow: hidden;
`;
