import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import messages from './routes/messages'

const app: Express = express()
const API_VERSION = '/api/v1'

app.use(express.json())
app.use(cors())

const URLS_ALLOWED_WITHOUT_TOKEN = ['/api/v1']

app.get(API_VERSION, (req: Request, res: Response) => {
    res.send('Hello World From the Typescript Server!')
})

const port = process.env.PORT ?? 8080

app.use(API_VERSION + '/messages', messages)

module.exports = app
