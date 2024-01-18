import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import messages from './routes/messages'

const app: Express = express()
const API_VERSION = '/v1'

app.use(express.json())
app.use(cors())

app.get(API_VERSION, (req: Request, res: Response) => {
    res.send('Hello World From the Typescript Server!')
})

app.use(API_VERSION + '/messages', messages)

module.exports = app
