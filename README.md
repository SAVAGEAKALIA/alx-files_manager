# File Manager API

The File Manager API is a backend service designed to manage files and folders, allowing users to upload, retrieve, and manage their files in a structured manner. 
This application uses Node.js, MongoDB, Redis, and Bull for its functionality, with authentication and file storage capabilities.

## Features
- User authentication with Basic Auth and Token-based session management.
- File and folder management, including upload, retrieval, and hierarchical organization.
- Public and private file access.
- File content retrieval and resizing (for images).
- Queue-based background processing with Bull.

---

## Table of Contents
1. [Installation](#installation)
2. [Usage](#usage)
3. [API Endpoints](#api-endpoints)
4. [Environment Variables](#environment-variables)
5. [Technologies Used](#technologies-used)
6. [File Structure](#file-structure)
7. [Contributing](#contributing)
8. [License](#license)

---

## Installation

### Prerequisites
Ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/)
- [Redis](https://redis.io/)
- [Bull](https://github.com/OptimalBits/bull)

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/file-manager-api.git
   cd file-manager-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the project root and add the following:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=27017
   DB_NAME=files_manager
   REDIS_HOST=localhost
   REDIS_PORT=6379
   FOLDER_PATH=/tmp/files_manager
   ```

4. Start the application:
   ```bash
   npm start
   ```

5. For development mode with live reloading:
   ```bash
   npm run dev
   npm run start-server
   ```

---

## Usage

### Run the Server
Start the API and access it via `http://localhost:5000`.

### Authentication
1. Login using Basic Auth (Base64 encoded `email:password`) to obtain a token.
2. Use the token in subsequent requests by setting it in the `X-Token` header.

---

## API Endpoints

### AppController
| Endpoint                  | Method | Description                       |
|---------------------------|--------|-----------------------------------|
| `/status`                 | GET    | Check if Redis and MongoDB are active. |
| `/stats`                  | GET    | Get the count of users and files. |

### Authentication
| Endpoint                  | Method | Description                       |
|---------------------------|--------|-----------------------------------|
| `/connect`                | GET    | Login with Basic Auth to get a token. |
| `/disconnect`             | GET    | Logout by invalidating the token. |

### FilesController
| Endpoint                  | Method | Description                       |
|---------------------------|--------|-----------------------------------|
| `/files`                  | POST   | Upload a file or folder.          |
| `/files/:id`              | GET    | Retrieve a specific file by ID.   |
| `/files`                  | GET    | List all files of the user.       |
| `/files/:id/publish`      | PUT    | Make a file public.               |
| `/files/:id/unpublish`    | PUT    | Make a file private.              |
| `/files/:id/data`         | GET    | Retrieve file content.            |

---

## Environment Variables
| Variable       | Description                                   |
|----------------|-----------------------------------------------|
| `PORT`         | Port where the server will run (default: 5000). |
| `DB_HOST`      | MongoDB host (default: localhost).            |
| `DB_PORT`      | MongoDB port (default: 27017).                |
| `DB_NAME`      | Database name for MongoDB.                   |
| `REDIS_HOST`   | Redis host (default: localhost).              |
| `REDIS_PORT`   | Redis port (default: 6379).                   |
| `FOLDER_PATH`  | Directory path for storing uploaded files.    |

---

## Technologies Used
- Node.js: Backend runtime for JavaScript.
- Express: Framework for building RESTful APIs.
- MongoDB: Database for user and file storage.
- Redis: In-memory data store for caching and token management.
- Bull: Queue processing for handling background tasks.
- dotenv: Environment variable management.

---

## File Structure
```
project-root/
├── controllers/
│   ├── AppController.js
│   ├── FilesController.js
├── utils/
│   ├── redis.js
│   ├── db.js
│   ├── getUserToken.js
│   ├── validateInput.js
│   ├── format.js
│   ├── formatSingleDocument.js
├── routes/
│   ├── index.js
├── .env
├── package.json
├── server.js
```

---

## Contributing
1. Fork the repository.
2. Create a new feature branch: `git checkout -b feature-name`.
3. Commit your changes: `git commit -m 'Add new feature'`.
4. Push to the branch: `git push origin feature-name`.
5. Open a pull request.

---

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

---

### Maintainer
Name: Saviour Davies Akalia
Email: akaliasaviour@gmail.com
Feel free to reach out with any questions or suggestions!

