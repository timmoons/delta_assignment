import * as mysql from "mysql2/promise";

import { Asset } from "../models";

export interface Store {
	add: (asset: Asset) => Promise<void>;
	getById: (id: number) => Promise<Asset | null>;
	countAll: () => Promise<number>;
}

export class MySqlStore implements Store {
	private readonly pool: mysql.Pool;

	constructor(options: mysql.PoolOptions) {
		this.pool = mysql.createPool(options);

		// initialize DB
		this.pool.execute(
		`
				CREATE TABLE IF NOT EXISTS Assets (
					id BIGINT(20) UNSIGNED NOT NULL,
					name VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
					shortCode VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
					type VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
					PRIMARY KEY (id)
				) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
			`
		);
	}

	public async add(asset: Asset) {
		await this.pool.execute(
			'INSERT INTO Assets (id, name, shortCode, type) VALUES (?, ?, ?, ?)',
			[asset.id, asset.name, asset.shortCode, asset.type]
		);
	}

	public async countAll() {
		const [rows, _] = await this.pool.execute<mysql.RowDataPacket[]>('SELECT COUNT(1) AS cnt FROM Assets');
		return rows[0].cnt;
	}

	public async getById(id: number) {
		const [rows, _] = await this.pool.execute<mysql.RowDataPacket[]>(
			'SELECT * FROM Assets WHERE id = ?',
			[id]
		);

		return rows.length === 1 ? rows[0] as Asset : null;
	}
}