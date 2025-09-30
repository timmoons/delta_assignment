import * as express from "express";
import * as bodyParser from 'body-parser';
import { createAssetHandler } from "./handlers/Asset";
import { AssetService } from "./services/Asset";
import { MySqlStore } from "./repositories/Store";
import { ElasticSearcher } from "./repositories/Search";
import { RedisCacher } from "./repositories/Cache";

const MYSQL_HOST = process.env.MYSQL_HOST ?? 'mysql';
const MYSQL_PORT = parseInt(process.env.MYSQL_PORT ?? '3306');
const MYSQL_USER = process.env.MYSQL_USER ?? 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD ?? 'test';
const MYSQL_DATABASE = process.env.MYSQL_DATABASE ?? 'test';

const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL ?? 'http://elasticsearch:9200';

const REDIS_HOST = process.env.REDIS_HOST ?? 'redis';
const REDIS_PORT = parseInt(process.env.REDIS_PORT ?? '6379');

const store = new MySqlStore({
    host: MYSQL_HOST,
    port: MYSQL_PORT,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
});
const searcher = new ElasticSearcher({
    node: ELASTICSEARCH_URL,
});
const cacher = new RedisCacher({
    host: REDIS_HOST,
    port: REDIS_PORT,
});
const assetService = new AssetService(store, searcher, cacher);

const app = express();
app.use(bodyParser.json());
app.get('/ping', (_, res) => {
    res.status(200);
    res.send('OK');
})
app.use('/assets', createAssetHandler(assetService));

app.listen(3000, () => {
    console.log('App listening on port 3000!');
});