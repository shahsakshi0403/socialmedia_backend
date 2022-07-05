require('dotenv').config();
const http = require('http');

const app = require('./app');

const server = http.createServer(app);

const { mongoConnect } = require('./services/mongo');

const PORT = process.env.PORT;
async function startServer() {
    await mongoConnect();
   
    server.listen(PORT, () => {
        console.log(`Server listening on Port ${PORT}...`);
    });
}

startServer();
