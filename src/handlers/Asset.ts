import { AssetService } from "../services/Asset";
import * as express from 'express';

export function createAssetHandler(assetService: AssetService) {
    const router = express.Router();

    // FIXME: add request validation

    router.post('/add', async (req, res) => {
        const asset = req.body;

        await assetService.add(asset);

        res.sendStatus(201);
    });

    router.get('/get', async (req, res) => {
        const { id } = req.query;

        const asset = await assetService.getById(parseInt(id as string));
        if (!asset) {
            res.sendStatus(404);
        } else {
            res.json({ asset });
        }
    });

    router.get('/count', async (_, res) => {
        const count = await assetService.getTotalCount();
        res.json({ count });
    });

    router.post('/search', async (req, res) => {
        const { query } = req.query;

        const assets = await assetService.search(query as string);
        res.json({ assets });
    });

    return router;
}