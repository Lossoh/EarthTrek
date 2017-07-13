var merge = require('deepmerge');
var earthtrekConfig = {
    dev: {
        app: {
            adapterView: 'react'
        },
        api: {
            url: "http://localhost:9081",
            username: "DEMO",
            app: "DEMO",
            token: "123456"
        }
    },
    mobileDev: {
        app: {
            frequency: 3,
            orbitDuration: 500
        },
        api: {
            url: "http://api.orbitaldesign.tk",
            username: "DEMO",
            app: "DEMO",
            token: "123456"
        }
    }
};
var defaultConfig = {
    app: {
        frequency: 30,
        orbitDuration: 7200,
        adapterView: 'vanilla'
    },
    api: {
        url: "http://api.orbitaldesign.tk",
        username: "DEMO",
        app: "DEMO",
        token: "123456",
        satellites: {
            endpoint: "satellites"
        },
        tle: {
            endpoint: "tles",
            fields: "tle,satId"
        }
    }
};
if (process.env.NODE_ENV == undefined) {
    process.env.NODE_ENV = ENVIRONMENT;
}
module.exports = merge(defaultConfig, earthtrekConfig[process.env.NODE_ENV]);