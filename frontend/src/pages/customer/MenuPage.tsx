import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CategoryTabs } from '@/components/customer/CategoryTabs'
import { MenuCard } from '@/components/customer/MenuCard'
import { CartDrawer } from '@/components/customer/CartDrawer'
import { CartFab } from '@/components/customer/CartFab'
import { useCart } from '@/contexts/CartContext'
import { getCategories, getMenus } from '@/services/customerApi'
import { queryKeys } from '@/lib/queryKeys'
import type { Menu } from '@/types'

export function MenuPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { addItem, totalCount, totalAmount, items } = useCart()

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories(1),
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  })

  const { data: menus = [], isLoading } = useQuery({
    queryKey: queryKeys.menus(1, selectedCategoryId ?? undefined),
    queryFn: () => getMenus(selectedCategoryId ?? undefined),
    staleTime: 5 * 60 * 1000,
  })

  const getCartQuantity = (menu: Menu) =>
    items.find((i) => i.menuId === menu.id)?.quantity ?? 0

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-20">
        <h1 className="text-xl font-bold text-center">메뉴</h1>
      </header>

      <div className="px-4 py-3 bg-white border-b sticky top-[61px] z-10">
        <CategoryTabs
          categories={categories}
          selectedId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
        />
      </div>

      <div className="px-4 py-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-48 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {menus.map((menu) => (
              <MenuCard
                key={menu.id}
                menu={menu}
                cartQuantity={getCartQuantity(menu)}
                onAdd={() => addItem(menu)}
              />
            ))}
          </div>
        )}
      </div>

      <CartFab
        itemCount={totalCount}
        totalAmount={totalAmount}
        onClick={() => setIsCartOpen(true)}
      />

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}
