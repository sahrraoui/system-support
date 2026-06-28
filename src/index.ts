import "dotenv/config";
import express, { Request, Response } from 'express';
import ticketRouter from "../ticket"
import cors from "cors";
const PORT = 3000;
const app = express();


app.use(express.json());
app.use(cors());
app.use(ticketRouter)
app.listen(PORT, () =>{
console.log('server is running')
});

