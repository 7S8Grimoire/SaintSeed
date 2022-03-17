const i18next = require('i18next');

i18next.init({
    lng: 'ru', // if you're using a language detector, do not define the lng option
    debug: false,
    resources: {
        en: require('../locales/en.json'),
        ru: require('../locales/ru.json'),
    }
});