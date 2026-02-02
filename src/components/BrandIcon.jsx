import React from 'react';

const BrandIcon = ({ size = 32, className = "" }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 500 500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#4338ca", stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: "#a855f7", stopOpacity: 1 }} />
                </linearGradient>
            </defs>

            <path d="M250 50 L400 125 L400 375 L250 450 L100 375 L100 125 Z" fill="url(#shieldGrad)" />

            <circle cx="250" cy="210" r="70" fill="none" stroke="white" strokeWidth="15" />
            <line x1="190" y1="270" x2="140" y2="330" stroke="white" strokeWidth="20" strokeLinecap="round" />

            <rect x="230" y="190" width="40" height="40" rx="5" fill="white" />
            <path d="M235 200 L265 200 M235 210 L265 210 M235 220 L265 220" stroke="#4338ca" strokeWidth="3" />

            <circle cx="210" cy="310" r="8" fill="white" />
            <circle cx="250" cy="330" r="8" fill="white" />
            <circle cx="290" cy="310" r="8" fill="white" />
            <line x1="250" y1="280" x2="210" y2="310" stroke="white" strokeWidth="3" />
            <line x1="250" y1="280" x2="250" y2="330" stroke="white" strokeWidth="3" />
            <line x1="250" y1="280" x2="290" y2="310" stroke="white" strokeWidth="3" />

            <path d="M360 180 L320 280 L350 280 L310 380" fill="none" stroke="#22c55e" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

export default BrandIcon;
