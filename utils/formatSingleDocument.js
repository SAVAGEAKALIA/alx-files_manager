async function formatSingleDocument(Document) {
    // Formatting logic for the document
    return {
        id: Document._id,
        userId: Document.userId,
        name: Document.name,
        type: Document.type,
        isPublic: Document.isPublic,
        // data: data,
        parentId: Document.parentId
    };
}

export default formatSingleDocument