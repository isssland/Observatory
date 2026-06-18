/**
 * IndexedDB 数据库层（基于 Dexie.js）
 *
 * 结构很简单：一张表存角色数据，key 固定为 'current'（单角色）。
 */

import Dexie, { type EntityTable } from 'dexie'
import type { CharacterState } from '../types'

/** 数据库中的角色记录 —— 用 id 做区分，支持未来扩展多角色 */
interface CharacterRecord {
  id: string
  data: CharacterState
  updatedAt: string
}

const db = new Dexie('Observatory') as Dexie & {
  characters: EntityTable<CharacterRecord, 'id'>
}

db.version(1).stores({
  characters: 'id, updatedAt',
})

// ==================== 读写操作 ====================

const CURRENT_KEY = 'current'

/** 从数据库加载角色数据。如果没有，返回 null。 */
export async function loadCharacter(): Promise<CharacterState | null> {
  const record = await db.characters.get(CURRENT_KEY)
  return record?.data ?? null
}

/** 保存角色数据到数据库 */
export async function saveCharacter(data: CharacterState): Promise<void> {
  await db.characters.put({
    id: CURRENT_KEY,
    data,
    updatedAt: new Date().toISOString(),
  })
}

export default db
