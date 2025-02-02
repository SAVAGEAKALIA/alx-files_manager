/* eslint-disable */
import express from 'express';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import Bull from 'bull';
import mimeTypes from 'mime-types';
import getUserToken from "../utils/getUserToken";
import validateInput from '../utils/validateInput'
import format from '../utils/format';
import formatSingleDocument from "../utils/formatSingleDocument";
import crypto from 'crypto'
import {tryCatch} from "bull/lib/utils";
import { ObjectId } from 'mongodb';
// require('dotenv').config();
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const fileQueue = new Bull('fileQueue');

class FilesController{
    static async postUpload(req, res) {

        // Create a new Bull Queue
        const fileQueue = new Bull('fileQueue')

        //1. Get Token from header to use to retrieve User
        const user_token = req.headers['x-token'] || "";

        if (!user_token || user_token.trim() !== "") {
            const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(req.params.id) });

            if (!file) {
                return res.status(404).json({ error: 'File not found' });
            }

            // Check if the file is public or the user is authorized
            // if (!file.isPublic && (!user_logged || user_logged._id.toString() !== file.userId.toString())) {
            //     return res.status(401).json({ error: 'Unauthorized' });
            // }

            return res.status(401).json({ error: 'Unauthorized' });
        }

        // 2. Get user using user Token
        const user_id = await redisClient.get(`auth_${user_token}`);

        if (!user_id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await dbClient.db.collection('users').findOne({ _id: new ObjectId(user_id) });

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });

        }

        // 3. Validate and sanitize file data
        const errors = await validateInput(req.body, dbClient.db);
        if (errors.length > 0) {
            return res.status(400).json({ error: errors[0] });
        }

        const name = req.body.name;
        const type = req.body.type;
        const data = req.body.data;
        const parentId = req.body.parentId || 0;
        const isPublic = req.body.isPublic || false;
        
        const updateDoc = {
            userId: user_id,
            name: name,
            type: type,
            // data: data,
            isPublic: isPublic,
            parentId: parentId
            // createdAt: new Date(),
            // updatedAt: new Date(),
        };


        // 4. check if type is a folder
        const bodyType = ['file', 'image']

        if (!bodyType.includes(type)) {
            const result = await dbClient.db.collection('files').insertOne(updateDoc);
            const new_id = result.insertedId
            const file_content = await dbClient.db.collection('files').findOne({ _id: ObjectId(new_id) })
            console.log(file_content)
            const formattedDocument = await formatSingleDocument(file_content)

            return res.status(200).json(formattedDocument);
            // return res.status(201).json({
            //     id: result.insertedId,
            //     userId: user_id,
            //     name: name,
            //     type: type,
            //     // data: data,
            //     parentId: parentId,
            //     isPublic: isPublic
            // })
        }

        // Step 5: Handle File or Image Storage
        const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
        // console.log(folderPath)
        // Check if the folder exists, and create it if it doesn't
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });

        }

        // Generate a unique local path for the file
        const localPath = path.join(folderPath, uuidv4());


        fs.writeFileSync(localPath, Buffer.from(data, 'base64'));

        const headerParent = isPublic
        console.log(headerParent)

        updateDoc.localPath = localPath;
        const result = await dbClient.db.collection('files').insertOne(updateDoc);
        const new_id = result.insertedId
        const file_content = await dbClient.db.collection('files').findOne({ _id: ObjectId(new_id) })
        console.log(file_content)

        try {
            if (file_content.type === 'image') {
                await fileQueue.add({
                    userId: user_id,
                    fileId: new_id,
                })

                // const failedJobs = await fileQueue.getFailed();
                // failedJobs.forEach(job => {
                //     console.log(`Failed job ${job.id}:`, job.failedReason);
                // });
                //
                // const waitingJobs = await fileQueue.getWaiting();
                // waitingJobs.forEach(job => {
                //     console.log(`Waiting job ${job.id}:`, job.data);
                // })
            }
        } catch (err) {
            console.error('Error processing image:', err);
            // res.status(500).send('Error processing image.')
        }

        // const formattedDocument = await formatSingleDocument(file_content)
        //
        // return res.status(200).json(formattedDocument);
        return res.status(201).json({
            id: result.insertedId,
            userId: user_id,
            name: name,
            type: type,
            // data: data,
            isPublic: isPublic,
            parentId: parentId
            // localPath: localPath
        });

    }


    static async getShow(req, res) {

        // const fileDocument = await dbClient.db.collection('files').findOne({ _id: ObjectId(id) });
        // const authorization_header_token = req.headers['x-token'] || '';
        //
        //
        // if (!authorization_header_token) {
        //     return res.status(401).json({ error: 'Missing or invalid authorization token'});
        // }
        //
        // const tokenId = authorization_header_token
        // const user_id = await redisClient.get(`auth_${tokenId}`);
        // const user_logged = await dbClient.db.collection('users').findOne({ _id: ObjectId(user_id) })

        const [user_id, user_logged] = await getUserToken(req.headers['x-token'] || '', res);
        // console.log(user_logged)

        if (!user_logged || user_logged.status === 401) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        // console.log(user_logged)

        const Id = req.params.id;

        const fileDocument = await dbClient.db.collection('files').findOne({ _id: ObjectId(Id), userId: user_id });

        try{
            const filefolder = await dbClient.db.collection('files').findOne({ _id: ObjectId(fileDocument.parentId), userId: user_id });
            console.log(filefolder)

        } catch (err) {
            console.log(err);
        }


        if (!fileDocument) {
            return res.status(404).json({ error: 'Not Found' })
        }
        console.log(fileDocument)

        const formattedDocument = await formatSingleDocument(fileDocument)

        return res.status(200).json(formattedDocument);
    }

    static async getIndex(req, res) {

        const [ user_id, user_logged ] = await getUserToken(req.headers['x-token'] || '', res);

        if (!user_logged || user_logged.status === 401) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const parentId = req.query.parentId || '0';
        const page = parseInt(req.query.page, 10) || 0;

        console.log(parentId)


        if (parentId !== '0') {
            console.log(parentId)
            console.log('Wrong path')
            console.log(user_logged)
            console.log(user_id)
            const fileDocument = await dbClient.db.collection('files')
                .find({
                    userId: user_id,
                    parentId: parentId,
                })
                .skip(page * 20)
                .limit(20)
                .toArray();



            const filesArray = await format(fileDocument)

            // const filesArray = []
            // for (const file in fileDocument) {
            //     // console.log(fileDocument[file]);
            //     const files = fileDocument[file]
            //     const filesDict = {}
            //     // console.log(files)
            //
            //     // add to a new dictionary then append that dictionary to an array
            //     for (const [keys, values] of Object.entries(files)) {
            //         // console.log(keys, values)
            //         if (keysArray.includes(keys)) {
            //             // Find the corresponding index in keysArray
            //             const index = keysArray.indexOf(keys);
            //             // Use this index to get the corresponding new key
            //             const newKey = newArray[index];
            //             // Set the value in the new dictionary
            //             filesDict[newKey] = values;
            //         }

            //     }
            //     // console.log(filesDict)
            //     filesArray.push(filesDict)
            // }


            console.log(filesArray)

            return res.status(200).json(
                filesArray
                // id: fileDocument._id,
                // userId: fileDocument.userId,
                // name: fileDocument.name,
                // type: fileDocument.type,
                // isPublic: fileDocument.isPublic,
                // // data: data,
                // parentId: fileDocument.parentId
            );

        } else {
            console.log('Right path')
            console.log(user_logged)
            console.log(user_id)
            const fileDocument = await dbClient.db.collection('files')
                .find({
                    userId: user_id
                })
                .skip(page * 20)
                .limit(20)
                .toArray();

            const filesArray = await format(fileDocument)

            return res.status(200).json(
                filesArray
                // id: fileDocument._id,
                // userId: fileDocument.userId,
                // name: fileDocument.name,
                // type: fileDocument.type,
                // isPublic: fileDocument.isPublic,
                // // data: data,
                // parentId: fileDocument.parentId
            );
        }
    }

    static async putPublish(req, res) {
        const [user_id, user_logged] = await getUserToken(req.headers['x-token'] || '', res);
        console.log(user_logged)

        if (!user_logged || user_logged.status === 401) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const Id = req.params.id;

        const fileDocument = await dbClient.db.collection('files').findOne({ _id: ObjectId(Id), userId: user_id });
        // console.log(fileDocument)

        if (!fileDocument) {
            return res.status(404).json({ error: 'Not Found' })
        }
        const updateDocument = await dbClient.db.collection('files').findOneAndUpdate({ _id: ObjectId(Id), userId: user_id }, { $set: { isPublic: true}}, { returnDocument: "after" })
        if (!updateDocument) {
            return res.status(500).json({ error: 'Internal Server Error Document Update Failed' })
        }
        // console.log(updateDocument)
        const retrievedDoc = updateDocument.value
        console.log(retrievedDoc)
        const formattedDocument = await formatSingleDocument(retrievedDoc)
        return res.status(200).json(formattedDocument)
    }

    static async putUnpublish(req, res) {
        const [user_id, user_logged] = await getUserToken(req.headers['x-token'] || '', res);
        console.log(user_logged)

        if (!user_logged || user_logged.status === 401) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const Id = req.params.id;

        const fileDocument = await dbClient.db.collection('files').findOne({ _id: ObjectId(Id), userId: user_id });
        // console.log(fileDocument)

        if (!fileDocument) {
            return res.status(404).json({ error: 'Not Found' })
        }
        const updateDocument = await dbClient.db.collection('files').findOneAndUpdate({ _id: ObjectId(Id), userId: user_id }, { $set: { isPublic: false}}, { returnDocument: "after" })
        if (!updateDocument) {
            return res.status(500).json({ error: 'Internal Server Error Document Update Failed' })
        }
        console.log(updateDocument)
        const retrievedDoc = updateDocument.value
        console.log(retrievedDoc)
        const formattedDocument = await formatSingleDocument(retrievedDoc)
        return res.status(200).json(formattedDocument)
    }

    static async getFile(req, res) {

        const Id = req.params.id;
        const sizes = req.query.size;

        // const [user_id, user_logged] = await getUserToken(req.headers['x-token'] || '', res);
        // console.log(user_logged + 'Useeeeeeeeeeeer')

        // if (!user_logged || user_logged.status === 401) {
        //     return res.status(401).json({ error: 'Unauthorized' })
        // }

        const tokenId = req.headers['x-token'] || '';
        const user_id = await redisClient.get(`auth_${tokenId}`);


        if (sizes && ![100, 250, 500].includes(parseInt(sizes, 10))) {
            return res.status(400).json({ error: 'Invalid size parameter' });
        }


        const fileDocument = await dbClient.db.collection('files').findOne({ _id: ObjectId(Id) });
        // console.log(fileDocument)

        if (!fileDocument) {
            return res.status(404).json({ error: 'Not Found' })
        }

        if (fileDocument.isPublic === false && !(!tokenId || !user_id)) {
            return res.status(404).json({ error: 'Not Found' })
        }

        if (fileDocument.type === 'folder') {
            return res.status(400).json({ error: 'A folder doesn\'t have content' })
        }

        if (!fileDocument.localPath) {
            return res.status(404).json({ error: 'Not found'})
        }

        // console.log(fileDocument.localPath)
        const localPath = fileDocument.localPath.toString()
        const name = fileDocument.name;
        const nameType = mimeTypes.lookup(name);
        // console.log(nameType)
        // const filePath = sizes ? `${localPath}_${sizes}` : localPath;
        //
        // if (!fs.existsSync(filePath)) {
        //     return res.status(404).json({ error: 'Not Found' });
        // }


        let content

        if (nameType.startsWith('text/')) {
            content = fs.readFileSync(localPath, 'utf8');
            console.log(content + 'WrongContent');
            return res.status(200).send(content);
        } else if (nameType.startsWith('image/')) {
            // fs.writeFileSync(localPath, Buffer.from(data, 'base64'));
            // content = fs.readFileSync(localPath);
            // console.log(content);
            const filePath = sizes ? `${localPath}_${sizes}` : localPath;
            console.log(filePath);

            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ error: 'Not Found' });
            }

            return res.sendFile(filePath);
        } else {
            console.log(`Unsupported MimeType ${nameType}`);
            return res.status(404).json({ error: 'Not Found' });
        }
        // console.log(content);
        // return res.status(200).send(content);
    }


}
export default FilesController;