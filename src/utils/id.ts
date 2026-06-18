/**
 * 生成唯一 ID
 * 使用 crypto.randomUUID()（浏览器原生支持）
 */
export function generateId(): string {
  return crypto.randomUUID()
}
