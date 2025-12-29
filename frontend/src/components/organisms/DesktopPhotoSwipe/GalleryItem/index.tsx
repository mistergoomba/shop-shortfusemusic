import React, { useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Figure } from './styles';
import { ItemProps, ItemRef } from '../types';

export const GalleryItem: React.FC<ItemProps> = ({ set, remove, open, ...rest }) => {
    const ref = useRef<HTMLElement>() as ItemRef;
    const onClick = useCallback(() => {
        if (open) open(ref);
    }, [open, ref]);

    useEffect(() => {
        if (!set || !remove || !ref.current) return;

        const { offsetHeight, offsetWidth } = ref.current;
        set(ref, {
            ...rest,
            width: offsetWidth * 1.5,
            height: offsetHeight * 1.5,
        });
        return () => remove(ref);
    }, [set, remove, ref, rest]);

    if (!set || !remove || !open) return null;

    return (
        <Figure onClick={onClick} ref={ref}>
            <Image
                src={rest.src || ''}
                alt={rest.alt || ''}
                width={typeof rest.width === 'number' ? rest.width : 800}
                height={typeof rest.height === 'number' ? rest.height : 600}
                style={{ width: '100%', height: 'auto' }}
            />
        </Figure>
    );
};
