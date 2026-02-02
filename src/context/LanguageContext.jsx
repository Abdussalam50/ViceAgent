import * as React from 'react';
import { en } from '../translations/en';
import { id } from '../translations/id';

// Provide a safe default to avoid "cannot destructure property 't' of undefined"
export const LanguageContext = React.createContext({
    lang: 'en',
    setLang: () => { },
    t: (key) => key
});

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = React.useState(() => {
        try {
            return localStorage.getItem('lang') || 'en';
        } catch (e) {
            return 'en';
        }
    });

    React.useEffect(() => {
        try {
            localStorage.setItem('lang', lang);
        } catch (e) {
            console.error("Failed to save language preference:", e);
        }
    }, [lang]);

    const t = (key, params = {}) => {
        const dictionary = lang === 'id' ? id : en;
        let translation = dictionary[key] || key;

        if (typeof translation !== 'string') return key;

        Object.keys(params).forEach(param => {
            translation = translation.replace(`{${param}}`, params[param]);
        });

        return translation;
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = React.useContext(LanguageContext);
    if (!context) {
        console.warn("useLanguage used outside of LanguageProvider. Using fallback.");
        return { lang: 'en', setLang: () => { }, t: (k) => k };
    }
    return context;
};
