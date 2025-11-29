import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import meetingRoutes from './routes/meetingRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;

app.use(cors());
app.use(express.json());

app.use('/', meetingRoutes);

app.listen(PORT, () => {
    console.log(`Meeting Service running on port ${PORT}`);
});
