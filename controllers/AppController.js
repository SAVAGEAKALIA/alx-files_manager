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

}
export default AppController;
