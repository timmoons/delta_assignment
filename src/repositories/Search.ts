import * as elastic from '@elastic/elasticsearch';

import { Asset } from "../models";

export interface Searcher {
    index: (asset: Asset) => Promise<void>;
    search: (query: string, limit: number) => Promise<Asset[]>;
}

export class ElasticSearcher implements Searcher {
    private readonly client: elastic.Client;

    public constructor(options: elastic.ClientOptions) {
        this.client = new elastic.Client(options);
    }

    public async index(asset: Asset) {
        await this.client.index({
            index: 'assets',
            id: asset.id.toString(),
            document: asset,
        });
    }

    public async search(query: string, limit: number) {
        const result = await this.client.search({
            index: 'assets',
            query: {
                dis_max: {
                    queries: [
                        {
                            match_phrase_prefix: {
                                name: {
                                    query,
                                }
                            }
                        },
                        {
                            match_phrase_prefix: {
                                shortCode: {
                                    query,
                                }
                            }
                        },
                    ],
                    tie_breaker: 0,
                }
            },
            size: limit,
        });

        return result.hits.hits.map(hit => hit._source as Asset);
    }
}