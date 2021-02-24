module.exports = {
    API_URL: process.env.VUE_APP_API_URL || window.location.protocol+'//'+window.location.hostname+':1337/',
    APP_NAME: process.env.VUE_APP_APP_NAME || "Universities app",
    FOOTER_TEXT: process.env.VUE_APP_FOOTER_TEXT || "2020 Created by Techsparks",
    USE_CAPTCHA: process.env.VUE_APP_USE_CAPTCHA==='true' ? true :false,
    CAPTCHA_SITEKEY: process.env.VUE_APP_CAPTCHA_SITEKEY
}