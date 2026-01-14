import swaggerJsdoc from 'swagger-jsdoc';
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'FTMS API Documentation',
            version: '1.0.0',
            description: 'API documentation for the Fashion Tailoring Management System',
            contact: {
                name: 'FTMS Support',
                email: 'support@ftms.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000/api',
                description: 'Development server',
            },
            {
                url: 'https://api.ftms.com/api',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./routes/*.ts', './schemas/*.ts'], // Path to the API docs
};
const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
