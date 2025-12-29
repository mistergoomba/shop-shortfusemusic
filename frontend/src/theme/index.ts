type Level = 0 | 25 | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 1000;
type FunctionTheme = {
    accent: (l: Level) => string;
    gray: (l: Level) => string;
    grayAlpha: (l: Level, alpha: number) => string;
    borderRadius: string;
};

type DetailTheme = {
    text: {
        main: string;
        inactive: string;
        subtitle: string;
        contrast: string;
    };
    background: {
        main: string;
        secondary: string;
        third: string;
        ice: string;
        white: string;
        modal: string;
    };
    button: {
        back: string;
        front: string;
        hover?: {
            back?: string;
            front?: string;
        };
        icon: {
            front: string;
            back?: string;
        };
    };
    shadow: string;
    error: string;
    success: string;
    tile: {
        background: string;
        hover: string;
    };
    placeholder: string;
    noteCard: string;
    outline: string;
    breakpoints: {
        /** 576px */
        ssm: string;
        /** 640px */
        sm: string;
        /** 768px */
        md: string;
        /** 1024px */
        lg: string;
        /** 1280px */
        xl: string;
        /** 1536px */
        '2xl': string;
    };
    price: {
        default: string;
        discount: string;
    };
};

export type MainTheme = FunctionTheme & DetailTheme;

const defaultThemeFunction = (hue: number) => ({
    accent: (l: Level) => `lch(${100.0 - l / 10.0}% ${l / 10.0} ${hue});`,
    gray: (g: Level) => `lch(${100.0 - g / 10.0}% 0 0);`,
    grayAlpha: (g: Level, alpha: number) => `lch(${100.0 - g / 10.0}% 0 0 / ${alpha});`,
    borderRadius: '0rem',
});

type Emotional = {
    theme: MainTheme;
};

type Gen<T> = {
    [P in keyof T]: T[P] extends string ? (emotionHtmlTheme: Emotional) => string : Gen<T[P]>;
};

const themeTransform = (t: MainTheme) => {
    const tree = (o: Record<string, string> | Record<string, unknown>, prefix: string[] = []) => {
        Object.entries(o).forEach(([k, v]) => {
            if (typeof v === 'string') {
                o[k] = (fn: Emotional) => {
                    const startingPoint = fn.theme as Record<string, unknown>;
                    const finalValue = [...prefix, k].reduce<Record<string, unknown> | string | undefined>((a, b) => {
                        if (a && typeof a === 'object') {
                            const value = a[b];
                            if (typeof value === 'string') {
                                return value;
                            }
                            if (value && typeof value === 'object') {
                                return value as Record<string, unknown>;
                            }
                        }
                    }, startingPoint);
                    return finalValue as string;
                };
            }
            if (v && typeof v === 'object') {
                tree(v as Record<string, unknown>, [...prefix, k]);
            }
        });
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { gray, accent, borderRadius, grayAlpha, ...rest } = t;
    const deepRestCopy = JSON.parse(JSON.stringify(rest));
    tree(deepRestCopy);
    return deepRestCopy as Gen<DetailTheme>;
};

export const createTheme = (
    hue: number,
    fn: (theme: FunctionTheme) => DetailTheme,
    themeFunction = defaultThemeFunction,
): MainTheme => {
    const r = themeFunction(hue);
    return {
        ...r,
        ...fn(r),
    };
};

export const LightTheme = createTheme(300, t => ({
    background: {
        main: 'oklch(35% .12 26.899)', // deeper background
        secondary: 'oklch(44.4% .177 26.899)', // rich black-red
        third: 'oklch(25% .08 26.899)', // very dark surfaces
        ice: 'oklch(30% .05 26.899)', // cool dark shade
        white: '#f8f8f8', // for contrast purposes
        modal: 'rgba(0, 0, 0, 0.75)', // darker modal backdrop
    },
    text: {
        main: '#f2f2f2', // high-contrast light text
        inactive: t.gray(600), // muted gray
        subtitle: '#c2c2c2', // lighter secondary text
        contrast: '#ffffff', // pure white if needed
    },
    button: {
        back: 'oklch(40% .2 27)', // dark red base
        front: '#ffffff', // white text on buttons
        icon: { front: '#f8f8f8' }, // icons visible on dark
    },
    shadow: '#00000030', // subtle black shadow
    error: 'oklch(65% .25 27)', // bright red error
    success: 'oklch(65% .15 142)', // green success tone
    price: {
        default: '#ffffff', // white for visibility
        discount: '#FF8080', // strong contrast red-pink
    },
    tile: {
        background: 'oklch(30% .08 26.899)', // dark card surface
        hover: 'oklch(40% .10 26.899)', // hover highlight
    },
    placeholder: '#888888', // muted input placeholder
    noteCard: '#331f1f', // eerie blood-paper tone
    outline: '#4a4a4a', // subtle outlines
    breakpoints: {
        ssm: '576px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
    },
}));

export const thv = themeTransform(LightTheme);
