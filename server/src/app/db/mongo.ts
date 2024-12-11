import {
  Db,
  Collection,
  MongoClient,
  Filter,
  Document,
  OptionalId,
  UpdateFilter,
} from 'mongodb';
import CONFIG from '../../config';

const getUri = (dbName: string) => `${CONFIG.MONGO.URI}/${dbName}`;

class MongoDb {
  mongoClients: Record<string, MongoClient> = {};

  connect = async (dbName: string): Promise<void> => {
    const uri = getUri(dbName);

    this.mongoClients[dbName] = new MongoClient(uri);
    await this.mongoClients[dbName].connect();
  };

  close = async (dbName: string): Promise<void> => {
    await this.mongoClients[dbName].close();
    delete this.mongoClients[dbName];
  };

  getDb = async (dbName: string): Promise<Db> => {
    const connected = this.mongoClients[dbName];

    if (!connected) {
      await this.connect(dbName);
    }

    const db = this.mongoClients[dbName].db(dbName);

    return db;
  };

  getCollection = async (dbName: string, collectionName: string): Promise<Collection<Document>> => {
    const database = await this.getDb(dbName);
    const collection = database.collection(collectionName);

    return collection;
  };

  findOne = async<T>(dbName: string, collectionName: string, filter: Filter<Document>) => {
    const collection = await this.getCollection(dbName, collectionName);
    const mongoResult = await collection.findOne(filter);

    return {
      message: mongoResult ? 'Document found' : 'No document satisfies the query',
      data: mongoResult as T | null,
    };
  };

  findMany = async <T>(dbName: string, collectionName: string, filter: Filter<Document>) => {
    const collection = await this.getCollection(dbName, collectionName);
    const mongoResult = await collection.find(filter).toArray();
    const { length } = mongoResult;

    return {
      message: `${length} documents found`,
      data: mongoResult as T | null,
      length,
    };
  };

  insertOne = async (dbName: string, collectionName: string, doc: OptionalId<Document>) => {
    const collection = await this.getCollection(dbName, collectionName);
    const mongoResult = await collection.insertOne(doc);
    const { insertedId } = mongoResult;

    return {
      message: 'Document added successfully',
      insertedId,
    };
  };

  insertMany = async (dbName: string, collectionName: string, docs: OptionalId<Document>[]) => {
    const collection = await this.getCollection(dbName, collectionName);
    const mongoResult = await collection.insertMany(docs);
    const { insertedCount, insertedIds } = mongoResult;

    return {
      message: `${insertedCount} documents added successfully`,
      insertedIds,
    };
  };

  deleteOne = async (dbName: string, collectionName: string, filter: Filter<Document>) => {
    const collection = await this.getCollection(dbName, collectionName);
    const mongoResult = await collection.deleteOne(filter);
    const { deletedCount } = mongoResult;

    return {
      message: deletedCount === 1 ? 'Document deleted successfully' : 'No document deleted - no document satisfies the query',
      ...(deletedCount && { deletedCount }),
    };
  };

  deleteMany = async (dbName: string, collectionName: string, filter: Filter<Document>) => {
    const collection = await this.getCollection(dbName, collectionName);
    const mongoResult = await collection.deleteMany(filter);
    const { deletedCount } = mongoResult;

    return {
      message: deletedCount > 0 ? `${deletedCount} documents deleted successfully` : 'No document deleted - no document satisfies the query',
      ...(deletedCount && { deletedCount }),
    };
  };

  updateOne = async (dbName: string, collectionName: string, filterAndUpdate: { filter: Filter<Document>, update: UpdateFilter<Document> | Partial<Document> }) => {
    const collection = await this.getCollection(dbName, collectionName);
    const mongoResult = await collection.updateOne(filterAndUpdate.filter, filterAndUpdate.update);
    const { matchedCount, modifiedCount } = mongoResult;

    return {
      message: modifiedCount === 1 ? 'Document modified successfully' : 'No document changed',
      matchedCount,
      modifiedCount,
    };
  };

  updateMany = async (dbName: string, collectionName: string, filterAndUpdate: { filter: Filter<Document>, update: UpdateFilter<Document> }) => {
    const collection = await this.getCollection(dbName, collectionName);
    const mongoResult = await collection.updateMany(filterAndUpdate.filter, filterAndUpdate.update);
    const { matchedCount, modifiedCount } = mongoResult;

    return {
      message: modifiedCount > 0 ? `${modifiedCount} documents modified successfully` : 'No document changed',
      matchedCount,
      modifiedCount,
    };
  };
}

export const mongoDb = new MongoDb();
