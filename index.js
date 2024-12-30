import axios from "axios"
import express from "express"
import cors from "cors"
const app = express()
const port = 3004
import expressGraphQL from "express-graphql"
import { graphql } from "graphql"
app.use(cors())
app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.use("/graphql", expressGraphQL({
    graphiql: true
}))
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})