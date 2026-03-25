import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            "Dashboard": "Dashboard",
            "Crop Advisory": "Crop Advisory",
            "Market Prices": "Market Prices",
            "Disease Detection": "Disease Detection",
            "Logout": "Logout",
            "Add New Farm": "Add New Farm",
            "Your Farms": "Your Farms",
            "Generate Advisory": "Generate Advisory",
            "Delete Farm": "Delete Farm",
            "Listen": "Listen to Advisory",
            "Stop": "Stop Audio",
            "language": "Language"
        }
    },
    hi: {
        translation: {
            "Dashboard": "डैशबोर्ड",
            "Crop Advisory": "फसल सलाह",
            "Market Prices": "बाजार भाव",
            "Disease Detection": "रोग पहचान",
            "Logout": "लॉग आउट",
            "Add New Farm": "नया खेत जोड़ें",
            "Your Farms": "आपके खेत",
            "Generate Advisory": "सलाह उत्पन्न करें",
            "Delete Farm": "खेत हटाएं",
            "Listen": "सलाह सुनें",
            "Stop": "ऑडियो रोकें",
            "language": "भाषा"
        }
    },
    te: {
        translation: {
            "Dashboard": "డాష్‌బోర్డ్",
            "Crop Advisory": "పంట సలహా",
            "Market Prices": "మార్కెట్ ధరలు",
            "Disease Detection": "వ్యాధి గుర్తింపు",
            "Logout": "లాగ్ అవుట్",
            "Add New Farm": "కొత్త పొలాన్ని జోడించండి",
            "Your Farms": "మీ పొలాలు",
            "Generate Advisory": "సలహాను రూపొందించండి",
            "Delete Farm": "పొలాన్ని తొలగించండి",
            "Listen": "సలహాను వినండి",
            "Stop": "ఆడియో ఆపండి",
            "language": "భాష"
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
