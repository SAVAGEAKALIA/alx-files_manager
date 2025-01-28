/* eslint-disable */
import { MongoClient } from 'mongodb';
import process from 'process';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    const url = `mongodb://${host}:${port}`;
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.db = null;
    this.ready = false; // Connections status

    // Connect to MongoDB
    this.client.connect()
      .then(() => {
        this.db = this.client.db(database);
        this.ready = true;
        console.log(`Connected to MongoDB at ${url} and ${database}`);
      })
      .catch((error) => {
        console.error(`Error connecting to MongoDB: ${error.message}`);
      });
  }

  isAlive() {
    // Check if the client is connected and the database is ready
    return this.ready && this.client.topology.isConnected();
  }

  async waitUntilReady() {
    // Wait for the connection to be established
    while (!this.ready) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  async nbUsers() {
    // Ensure the database is ready before querying
    await this.waitUntilReady();
    const result = await this.db.collection('users').countDocuments({});
    return result;
  }

  async nbFiles() {
    // Ensure the database is ready before querying
    await this.waitUntilReady();
    const files = await this.db.collection('files').countDocuments({});
    return await this.db.collection('files').countDocuments({});
  }
}

const dbClient = new DBClient();
export default dbClient;
