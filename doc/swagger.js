const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API 文档',
            version: '1.0.0',
            description: 'API 文档描述',
        },
        tags: [
            { name: "User", description: "用户管理相关接口" },
            { name: "Order", description: "订单管理相关接口" }
        ],
        servers: [
            {
                url: 'http://localhost:3000',
                description: '本地服务器',
            },
        ],
    },
    apis: ['./routes/*.js'], // 指定路由文件路径
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

module.exports = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};