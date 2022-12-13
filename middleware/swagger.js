const swaggerUi = require('swagger-ui-express');

module.exports = (app) => {
    const options = {
        explorer: true,
        customSiteTitle: 'Venn - User Service',
        customfavIcon: '/public/logo.PNG',
        swaggerOptions: {
            urls: [
                {
                    url: '/public/swagger/open.json',
                    name: "All open APIs"
                },
                {
                    url: '/public/swagger/admin.json',
                    name: "All Admin APIs"
                },
                {
                    url: '/public/swagger/user.json',
                    name: "All User APIs"
                }
            ]
        }
    };

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(null, options));

    return app;
};
