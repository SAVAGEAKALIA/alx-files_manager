require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Get the folder path from environment variables
const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';

console.log(folderPath)
// Check if the folder exists, and create it if it doesn't
if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
}

// Generate a unique local path for the file
const localPath = path.join(folderPath, uuidv4() + '.docx');

// Example data to write to the file
const data = 'sample data'; // Replace with your actual data
fs.writeFileSync(localPath, Buffer.from(data, 'utf-8'));

console.log(`File saved at: ${localPath}`);
