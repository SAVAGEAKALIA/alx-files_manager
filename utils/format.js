/* eslint-disable */
async function format(fileDocument) {

    const keysArray = ['_id', 'userId', 'name', 'type', 'isPublic', 'parentId']
    const newArray = ['id', 'userId', 'name', 'type', 'isPublic', 'parentId']
    const filesArray = fileDocument.map(file => {
        const filesDict = {}

        keysArray.forEach((key, index) => {
            if (file[key] !== undefined && file[key] !== null) {
                filesDict[newArray[index]] = file[key];
            }
        });

        return filesDict;
    });

    return filesArray;
}

export default format;