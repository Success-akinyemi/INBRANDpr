import express from 'express'
import cors from 'cors';
import { config } from "dotenv";
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import http from 'http'
config()

const app = express()
const server = http.createServer(app); 

//DB
import './connection/db.js';

// CORS setup
const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.ADMIN_URL,
];

const corsOptions = {
    origin: function (origin, callback) {
        console.log('URL ORIGIN', origin);
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS', 'ORIGIN>', origin));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

//EXPRESS MIDDLEWARE
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// DOCs
import swaggerUI from 'swagger-ui-express';
import YAML from 'yamljs';

const swaggerJSDocs = YAML.load('./docs/api.yaml');
//const swaggerAdminJSDocs = YAML.load('./docs/admin-api.yaml');

// Serve Swagger UI correctly for each route
// Serve Swagger UI correctly for each route
const swaggerApiUI = swaggerUI.serveFiles(swaggerJSDocs, { explorer: true });
//const swaggerAdminUI = swaggerUI.serveFiles(swaggerAdminJSDocs, { explorer: true });

app.use('/api-doc', swaggerApiUI, swaggerUI.setup(swaggerJSDocs, { explorer: true }));
//app.use('/api/admin-doc', swaggerAdminUI, swaggerUI.setup(swaggerAdminJSDocs, { explorer: true }))

// Routes
app.get('/', (req, res) => {
    res.status(200).json('Home GET Request');
});

import ServiceRoute from './routes/services.routes.js'
import TrainingProgramRoute from './routes/trainingProgram.routes.js'
import ProjectRoute from './routes/projects.routes.js'
import FaqRoute from './routes/faq.routes.js'
import SubscriberRoute from './routes/subscriber.routes.js'
import ClientStoryRoute from './routes/clientStory.routes.js'
import TeamMembersRoute from './routes/teamMembers.routes.js'
import ContactUsRoute from './routes/contactUs.controllers.js'
import BlogRoute from './routes/blogs.routes.js'
import EventRoute from './routes/event.routes.js'
import CommunityRoute from './routes/communities.routes.js'

app.use('/api/service', ServiceRoute)
app.use('/api/trainingProgram', TrainingProgramRoute)
app.use('/api/project', ProjectRoute)
app.use('/api/faq', FaqRoute)
app.use('/api/subscriber', SubscriberRoute)
app.use('/api/clientStory', ClientStoryRoute)
app.use('/api/teamMembers', TeamMembersRoute)
app.use('/api/contactUs', ContactUsRoute)
app.use('/api/blog', BlogRoute)
app.use('/api/event', EventRoute)
app.use('/api/community', CommunityRoute)




const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
