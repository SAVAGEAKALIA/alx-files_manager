/* eslint-disable */
import redisClient from "./redis";
import dbClient from "./db";
import {ObjectId} from "mongodb";

async function getUserToken(token, res) {
    // const authorization_header_token = req.headers['x-token'] || '';
    const userAndIdArray = [];


    if (token) {
        // errors.push('Missing or invalid authorization token')
        // return res.status(401).json({ error: 'Not found'});
        const tokenId = token
        const user_id = await redisClient.get(`auth_${tokenId}`);
        userAndIdArray.push(user_id)
        const user_logged = await dbClient.db.collection('users').findOne({ _id: ObjectId(user_id) })
        userAndIdArray.push(user_logged)
        console.log(userAndIdArray)
        return userAndIdArray
    }

    return ['', '']
}

export default getUserToken;