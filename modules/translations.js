const i18next = require('i18next');

i18next.init({
    lng: 'en', // if you're using a language detector, do not define the lng option
    debug: false,
    resources: {
        en: require('../locales/en.json'),        
    }
});