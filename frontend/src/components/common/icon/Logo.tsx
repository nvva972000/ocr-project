import React from 'react';
import logoImage from '@assets/logo.png';

interface LogoProps {
    height?: number;
    width?: number;
    alt?: string;
}

const Logo: React.FC<LogoProps> = ({ height, width, alt = 'Logo' }) => {
    return (
        <img 
            src={logoImage}
            alt={alt}
            height={height || 35}
            width={width || 35}
            style={{ 
                height: `${height || 35}px`, 
                width: `${width || 35}px`,
                objectFit: 'contain',
                display: 'block'
            }}  
        />
    );
};

export default Logo;

