import { MongoClient } from 'mongodb';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async () => {
      let url = process.env.PLAY_MONGODB_URI || 'mongodb://localhost:27017/builder6';

      // Regex to match connection string without a database path
      const noDbPattern = /^((?:mongodb(?:\+srv)?):\/\/[^/]+)(?:\/)?(\?.*)?$/;
      const match = url.match(noDbPattern);

      if (match) {
        const base = match[1];
        const query = match[2] || '';
        const dbName = process.env.PLAY_MONGODB_DB || 'builder6';
        url = `${base}/${dbName}${query}`;
        console.warn(
          `[DatabaseProvider] Auto-appending database name '${dbName}' to connection string.`,
        );
      }

      const client = new MongoClient(url);
      await client.connect();
      return client.db();
    },
  },
];
