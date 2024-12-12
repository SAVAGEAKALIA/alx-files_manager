/* eslint-disable */
import redis from 'redis';

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    // this.connected = false;

    this.client.on('error', (error) => {
      console.log(`The Redis client server encountered this error: ${error}`);
    });

    this.client.on('connect', () => {
      console.log('The Redis client is connected successfully');
      // this.connected = true;
    });
  }

  // async init() {
  //   // Wait for the 'ready' event to ensure the client is connected
  //   return new Promise((resolve, reject) => {
  //     if (this.connected) {
  //       resolve();
  //     } else {
  //       this.client.once('ready', () => {
  //         this.connected = true;
  //         resolve();
  //       });
  //       this.client.once('error', (error) => {
  //         reject(error);
  //       });
  //     }
  //   });
  // }

  isAlive() {
    // In older versions of Redis client, there is no isOpen method.
    // Use the 'connected' property instead.
    // return this.client.connected;
    // return this.client.connected;
    return this.client.ready;
  }

  async get(key) {
    // Use Promises to handle the asynchronous get method.
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, reply) => {
        if (err) {
          return reject(err);
        }
        resolve(reply);
      });
    });
  }

  async set(key, value, expires) {
    // Use Promises to handle the asynchronous set method with expiration.
    return new Promise((resolve, reject) => {
      this.client.set(key, value, 'EX', expires, (err, reply) => {
        if (err) {
          return reject(err);
        }
        resolve(reply);
      });
    });
  }

  async del(key) {
    // Use Promises to handle the asynchronous del method.
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, reply) => {
        if (err) {
          return reject(err);
        }
        resolve(reply);
      });
    });
  }
}

// Create and export an instance of RedisClient
const redisClient = new RedisClient();
export default redisClient;
