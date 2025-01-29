/* eslint-disable */
import express from 'express';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import crypto from "crypto";
import { v4 as uuidv4 } from 'uuid';

class AppController{
    static async getStatus(req, res){
        console.log('Redis status:', redisClient.isAlive());
        console.log('DB status:', dbClient.isAlive());
        res.status(200).json({
            redis: redisClient.isAlive(),
            db: dbClient.isAlive()
        })
    }

    static async getStats(req, res) {
        try{
          const users = await dbClient.nbUsers()
          // console.log(user_count)
          const files = await dbClient.nbFiles()
          res.status(200).json({
              users,
              files})
        } catch (err) {
            console.error('Error getting stats:', err);
            res.status(500).json({ error: 'Unable to fetch stats', err });
        }
    }

}
export default AppController;
