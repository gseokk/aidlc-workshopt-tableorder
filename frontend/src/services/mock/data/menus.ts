import type { MenuCategory, Menu } from '@/types'

export const mockCategories: MenuCategory[] = [
  { id: 1, name: '커피', displayOrder: 1 },
  { id: 2, name: '논커피', displayOrder: 2 },
  { id: 3, name: '에이드', displayOrder: 3 },
  { id: 4, name: '디저트', displayOrder: 4 },
  { id: 5, name: '식사', displayOrder: 5 },
]

export const mockMenus: Menu[] = [
  { id: 1, categoryId: 1, categoryName: '커피', name: '아메리카노', price: 4500, description: '진한 에스프레소와 물', imageUrl: null, displayOrder: 1 },
  { id: 2, categoryId: 1, categoryName: '커피', name: '카페라떼', price: 5000, description: '에스프레소와 우유', imageUrl: null, displayOrder: 2 },
  { id: 3, categoryId: 1, categoryName: '커피', name: '카푸치노', price: 5000, description: '에스프레소와 우유 거품', imageUrl: null, displayOrder: 3 },
  { id: 4, categoryId: 1, categoryName: '커피', name: '바닐라라떼', price: 5500, description: '바닐라 시럽 라떼', imageUrl: null, displayOrder: 4 },
  { id: 5, categoryId: 2, categoryName: '논커피', name: '그린티라떼', price: 5500, description: '말차 라떼', imageUrl: null, displayOrder: 1 },
  { id: 6, categoryId: 2, categoryName: '논커피', name: '초코라떼', price: 5500, description: '진한 초콜릿 라떼', imageUrl: null, displayOrder: 2 },
  { id: 7, categoryId: 3, categoryName: '에이드', name: '레몬에이드', price: 5000, description: '상큼한 레몬 에이드', imageUrl: null, displayOrder: 1 },
  { id: 8, categoryId: 3, categoryName: '에이드', name: '자몽에이드', price: 5000, description: '자몽 에이드', imageUrl: null, displayOrder: 2 },
  { id: 9, categoryId: 4, categoryName: '디저트', name: '치즈케이크', price: 6500, description: '부드러운 치즈케이크', imageUrl: null, displayOrder: 1 },
  { id: 10, categoryId: 4, categoryName: '디저트', name: '초코머핀', price: 3500, description: '촉촉한 초코 머핀', imageUrl: null, displayOrder: 2 },
  { id: 11, categoryId: 5, categoryName: '식사', name: '크로크무슈', price: 8500, description: '따뜻한 샌드위치', imageUrl: null, displayOrder: 1 },
  { id: 12, categoryId: 5, categoryName: '식사', name: '파니니', price: 8000, description: '그릴 파니니', imageUrl: null, displayOrder: 2 },
]
