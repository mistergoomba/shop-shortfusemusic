import React, { useEffect, useState } from 'react';
import { useSlider } from './Slider/hooks';
import styled from '@emotion/styled';
import { Hero } from './Hero';
import { useTranslation } from 'react-i18next';

interface HeroSlide {
    h1: string;
    h2: string;
    desc: string;
    cta: string;
    image: string;
    bgImage: string;
    link: string;
}

export const HeroSlider: React.FC = () => {
    const [jsEnabled, setJsEnabled] = useState(false);
    const { t, ready } = useTranslation('homepage');
    const { ref, nextSlide } = useSlider({
        spacing: 0,
        loop: true,
        options: {
            slides: { perView: 1 },
            mode: 'snap',
            drag: true,
        },
    });

    useEffect(() => {
        setJsEnabled(true);
    }, []);

    useEffect(() => {
        if (jsEnabled) {
            const interval = setInterval(() => {
                nextSlide();
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [jsEnabled, nextSlide]);

    if (!ready) {
        return null;
    }

    const heroSlides: HeroSlide[] = [
        {
            h1: t('hero-h1'),
            h2: t('hero-h2'),
            desc: t('hero-p'),
            cta: t('hero-cta'),
            link: t('hero-link'),
            image: '/images/grim-cover.png',
            bgImage: '/images/grim-bg.png',
        },
        {
            h1: t('hero-2-h1', 'Online Exclusive Merch'),
            h2: t('hero-2-h2', ''),
            desc: t('hero-2-p', "Check out our threadless store for items you can't find anywhere else"),
            cta: t('hero-2-cta', 'Visit our Threadless Store'),
            link: 'https://shortfusemusic.threadless.com/',
            image: '/images/threadless-shirt.png',
            bgImage: '/images/threadless-bg.png',
        },
    ];

    return (
        <Wrapper>
            {jsEnabled ? (
                <SliderContainer className="keen-slider" ref={ref}>
                    {heroSlides.map((slide, idx) => (
                        <div key={idx} className="keen-slider__slide">
                            <Hero {...slide} />
                        </div>
                    ))}
                </SliderContainer>
            ) : (
                <Hero {...heroSlides[0]} />
            )}
        </Wrapper>
    );
};

const Wrapper = styled.div`
    width: 100%;
    position: relative;
`;

const SliderContainer = styled.div`
    width: 100%;
`;
