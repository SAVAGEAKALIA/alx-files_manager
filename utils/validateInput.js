/* eslint-disable */
import { ObjectId } from 'mongodb';
async function validateInput(body, db) {
    const errors = [];

    if (!body.name || body.name.trim() === '') {
        errors.push('Missing name');
    }

    const validType = ['folder', 'file', 'image'];
    if (!body.type || !validType.includes(body.type)) {
        errors.push('Missing Type');
    }

    if (!body.data && body.type !== 'folder') {
        errors.push('Missing data');
    }

    if (body.parentId !== 0 && body.parentId) {
        const parentFile = await db
            .collection('files')
            .findOne({ _id: ObjectId(body.parentId) });
        if (!parentFile) {
            errors.push('Parent not found');
        }
        if (parentFile.type !== 'folder') {
            errors.push('Parent is not a folder');
        }
    }


    return errors;
}

export default validateInput;
