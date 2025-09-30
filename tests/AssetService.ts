import 'mocha';
import { assert } from 'chai';
import { AssetService } from "../src/services/Asset";
import { Asset } from "../src/models";

describe('AssetService', () => {
    let service: AssetService;
    beforeEach(() => {
        const assets: Asset[] = [];
        service = new AssetService(
            {
                add: async (asset: Asset) => {
                    assets.push(asset);
                },
                getById: async (id: number) => {
                    return assets.find(asset => asset.id === id) ?? null;
                },
                countAll: async () => {
                    return assets.length;
                }
            },
            {
                search: async (_) => {
                    return [];
                },
                index: async (_) => {},
            },
            {
                invalidateKey: async (_) => {},
                getOrAdd: async (_, factoryFn) => {
                    return await factoryFn();
                },
            }
        );
    });

    it('should increment total when a new document was added', async () => {
        assert.equal(await service.getTotalCount(), 0);

        await service.add({
            id: 1,
            name: 'Bitcoin',
            shortCode: 'BTC',
            type: 'CRYPTO',
        });

        assert.equal(await service.getTotalCount(), 1);
    });
});