import i18next from 'i18next';

export function initLocalization() {
  i18next.init({
    lng: 'ru', // if you're using a language detector, do not define the lng option
    debug: false,
    resources: {
      en: require('../locales/en.json'),
      ru: require('../locales/ru.json'),
    },
    interpolation: { 
      escapeValue: false,
    }
  });
}