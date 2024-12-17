/* eslint-disable */
import Bull from 'bull';
import { ObjectId } from 'mongodb';
import imageThumbnail from 'image-thumbnail';
import fs from 'fs';
import dbClient from './utils/db';
// import fileQueue from './controllers/FilesController';

const fileQueue = new Bull('fileQueue');

// Process jobs in the queue
fileQueue.process(async (job) => {

    // try {
    //     const { userId, fileId } = job.data;
    //     console.log(`Processing job: userId=${userId}, fileId=${fileId}`);
    //     // Rest of the logic...
    // } catch (err) {
    //     console.error('Error processing job:', err);
    //     throw err; // Let Bull mark the job as failed.
    // }
    const { userId, fileId } = job.data;
    console.log(`Processing job: userId=${userId}, fileId=${fileId}`);
    // const { userId, fileId } = job.data;
    // console.log('Image upload  Received successfully')


    // Validate inputs
    if (!fileId) throw new Error('Missing fileId');
    if (!userId) throw new Error('Missing userId');

    // Retrieve file document from DB
    const fileDocument = await dbClient.db.collection('files').findOne({
        _id: new ObjectId(fileId),
        userId,
    });

    if (!fileDocument) throw new Error('File not found');
    if (fileDocument.type !== 'image') throw new Error('Not an image file');

    const localPath = fileDocument.localPath;

    try {
        // Generate thumbnails
        const sizes = [500, 250, 100];
        for (const size of sizes) {
            const thumbnail = await imageThumbnail(localPath, { width: size });
            const thumbnailPath = `${localPath}_${size}`;
            fs.writeFileSync(thumbnailPath, thumbnail);

        console.log('Done: ' + thumbnailPath);
        }
    } catch (error) {
        console.error('Error generating thumbnails:', error);
        throw error;
    }
});

// export default fileQueue;

