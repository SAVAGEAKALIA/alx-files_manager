/* eslint-disable */
import express from 'express';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import crypto from "crypto";
import { v4 as uuidv4 } from 'uuid';

class AppController{
    static async getStatus(req, res){
        res.status(200).json({
            redis: redisClient.isAlive(),
            db: dbClient.isAlive()
        })
    }

    static async getStats(req, res) {
        try{
          const user_count = await dbClient.nbUsers()
          console.log(user_count)
          const files_count = await dbClient.nbFiles()
          res.status(200).json({
              user_count,
              files_count})
        } catch (err) {
            console.error('Error getting stats:', err);
            res.status(500).json({ error: 'Unable to fetch stats', err });
        }
    }

    static async getConnect(req, res) {

        // console.log('getConnect route hit');
        // 1. get authorization header
        const authorization_header = req.headers.authorization || ""

        if (!authorization_header.startsWith('Basic ')) {
            return res.status(401).json({ error: 'Missing or invalid authorization token' });
        }

        // 3. split and decode authorization header
        const base64Credentials = authorization_header.split(' ')[1];
        const decodedDetails = Buffer.from(base64Credentials, 'base64').toString('utf-8');
        // console.log('Decoded Details:', decodedDetails);
        const [email, password] = decodedDetails.split(':');

        // console.log('Email:', email); // Debug log
        // console.log('Password:', password); // Debug log
        if (!email) {
            return res.status(401).json({ error: 'Invalid email' });
        }

        if (!password) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // 3. hash password
        const hashPassword = crypto.createHash('sha1').update(password).digest('hex');
        const user = await dbClient.db.collection('users').findOne({ email, password: hashPassword})

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // 4. Generate a Token
        const token = uuidv4();
        // console.log('Setting Redis key:', `auth_${token}`, user._id.toString());
        await redisClient.set(`auth_${token}`, user._id.toString(), 86400);
        return res.status(200).json({
            token: token
        });
    }

    static async getDisconnect(req, res) {
        // 1. get X-token header
        // console.log('Headers:', req.headers);console.log('Headers:', req.headers);
        const authorization_header_token = req.headers['x-token'] || '';

        console.log(authorization_header_token)

        if (!authorization_header_token) {
            return res.status(401).json({ error: 'Missing or invalid authorization token'});
        }
        // 2. split and decode token
        const token = authorization_header_token

        // 3. delete Redis key
        const user_id = await redisClient.get(`auth_${token}`);

        if (!user_id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        await redisClient.del(`auth_${token}`);

        return res.status(204).send();
    }
}
export default AppController;
