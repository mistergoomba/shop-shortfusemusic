interface SvgProps {
    width?: number;
    height?: number;
}

export const LogoAexol: React.FC<SvgProps> = ({ width }) => (
    <img src="/images/sf-logo.png" alt="Short Fuse" width={width || 100} />
);
