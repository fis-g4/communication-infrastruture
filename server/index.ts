import './loadEnvironment'

const port = process.env.PORT ?? 8001
const app = require('./app')

app.listen(port, () => {
    console.info(`Communication microservice listening on port ${port}`)
})
