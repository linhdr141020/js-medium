import axios from "axios"
import express from "express"
import cors from "cors"
import Redis from "ioredis";
const client = new Redis("127.0.0.1:6379");
const app = express()
const port = 3004
app.use(cors())
app.get('/', (req, res) => {
    res.send('Hello World!')
})
const DEFAULT_EXPIRATION = 600;
app.get("/git-profile", async (req, res) => {
    const gitId = req.query.gitId;
    const profile = await getOrSetCache(`profile?gitId=${gitId}`, async () => {
        console.log("Cache Miss");
        const response = await fetch(`https://api.github.com/users?gitId=${gitId}`, {
            headers: { "Content-Type": "application/json" },
            method: "GET",
        });
        const data = await response.json();
        client.setex(`profile?gitId=${gitId}`, DEFAULT_EXPIRATION, JSON.stringify(data));
        return data;
    })
    res.json(profile)
    // client.get(`profile?gitId=${gitId}`, async (error, profile) => {
    //     if(error) console.error(error);
    //     if(profile != null) {
    //         console.log("Cache Hit");
    //         return res.json(JSON.parse(profile));
    //     } else {
    //         console.log("Cache Miss");
    //         const response = await fetch(`https://api.github.com/users?gitId=${gitId}`, {
    //             headers: { "Content-Type": "application/json" },
    //             method: "GET",
    //         });
    //         const data = await response.json();
    //         client.setex(`profile?gitId=${gitId}`, DEFAULT_EXPIRATION, JSON.stringify(data))
    //         res.json(data)
    //     }
    // })
})
const getOrSetCache = (key, callback) => {
    return new Promise((resolve, reject) => {
        client.get(key, async (error, data) => {
            if (error) return reject(error);
            if (data != null) {
                console.log("Cache Hit");
                return resolve(JSON.parse(data))
            };
            const freshData = await callback();
            client.setex(key, DEFAULT_EXPIRATION, JSON.stringify(freshData));
            resolve(freshData);
        })
    })
}
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})