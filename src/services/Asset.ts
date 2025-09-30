import { Store } from "../repositories/Store";
import { Asset } from "../models";
import { Searcher } from "../repositories/Search";
import { Cacher } from "../repositories/Cache";

const TOTAL_COUNT_CACHE_KEY = 'totalCount';

export class AssetService {
	private readonly cacher: Cacher;
	private readonly searcher: Searcher;
	private readonly store: Store;

	constructor(store: Store, searcher: Searcher, cacher: Cacher) {
		this.store = store;
		this.searcher = searcher;
		this.cacher = cacher;
	}

	public async add(asset: Asset) {
		await this.store.add(asset);
		await this.searcher.index(asset);
		await this.cacher.invalidateKey(TOTAL_COUNT_CACHE_KEY);
	}

	public async search(query: string) {
		return await this.searcher.search(query, 10);
	}

	public async getById(id: number) {
		return await this.store.getById(id);
	}

	public async getTotalCount() {
		return await this.cacher.getOrAdd(TOTAL_COUNT_CACHE_KEY, async () => {
			return await this.store.countAll();
		});
	}
}