/* eslint-disable */
import express from 'express';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import crypto from 'crypto'
import {tryCatch} from "bull/lib/utils";
import { ObjectId } from 'mongodb';

class UsersController {
    static async postNew(req, res) {
        const {email, password} = req.body;
        if(!email){
            return res.status(400).json({
                error: 'Missing email'
            })
        }

        if(!password){
            return res.status(400).json({
                error: 'Missing password'
            })
        }

        const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
        const user = await dbClient.db.collection('users').findOne({ email })

        if(user){
            return res.status(400).json({
                error: 'Already exist'
            })
        }
        try{
            const result = await dbClient.db.collection('users').insertOne({ email: email, password: hashedPassword })
            const userId = result.insertedId
            return res.status(201).json({
                // success: 'User created successfully',
                id: userId,
                email: email
            })

        } catch (err){
            console.error(err)
            return res.status(500).json({
                error: 'Internal server error'
            })
        }
    }

    static async getMe(req, res) {
        // 1. get X-token header
        // console.log('Headers:', req.headers);console.log('Headers:', req.headers);
        const authorization_header_token = req.headers['x-token'] || '';

        // console.log(authorization_header_token)

        if (!authorization_header_token) {
            return res.status(401).json({ error: 'Missing or invalid authorization token user control'});
        }
        // 2. split and decode token
        // const tokenId = authorization_header_token

        // 3. delete Redis key
        const user_id = await redisClient.get(`auth_${authorization_header_token}`);

        // console.log(user_id);

        if (!user_id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const user_logged = await dbClient.db.collection('users').findOne({ _id: ObjectId(user_id) })
        // console.log(user_logged)

        return res.status(201).json({id: user_logged._id, email: user_logged.email});
    }
}

export default UsersController;