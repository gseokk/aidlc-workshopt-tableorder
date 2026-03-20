export const queryKeys = {
  menus: (storeId: number, categoryId?: number) =>
    ['menus', storeId, categoryId] as const,
  categories: (storeId: number) =>
    ['categories', storeId] as const,
  sessionOrders: (sessionId: number) =>
    ['orders', 'session', sessionId] as const,
  tableOrders: (tableId: number) =>
    ['orders', 'table', tableId] as const,
  tableHistory: (tableId: number, from?: string, to?: string) =>
    ['orders', 'history', tableId, from, to] as const,
}
