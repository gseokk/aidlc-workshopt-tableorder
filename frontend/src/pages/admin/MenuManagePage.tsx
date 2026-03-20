import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { MenuForm } from '@/components/admin/MenuForm'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useToast } from '@/components/common/Toast'
import { getAdminMenus, getAdminCategories, createMenu, updateMenu, deleteMenu } from '@/services/adminApi'
import type { Menu, MenuFormData } from '@/types'

export function MenuManagePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { show: showToast } = useToast()
  const [editingMenu, setEditingMenu] = useState<Menu | null | undefined>(undefined) // undefined=닫힘, null=신규, Menu=수정
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)

  const { data: menus = [] } = useQuery({
    queryKey: ['admin-menus'],
    queryFn: getAdminMenus,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: getAdminCategories,
  })

  const createMutation = useMutation({
    mutationFn: (data: MenuFormData) => createMenu(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menus'] })
      showToast('메뉴가 등록되었습니다', 'success')
      setEditingMenu(undefined)
    },
    onError: () => showToast('등록에 실패했습니다', 'error'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: MenuFormData }) => updateMenu(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menus'] })
      showToast('메뉴가 수정되었습니다', 'success')
      setEditingMenu(undefined)
    },
    onError: () => showToast('수정에 실패했습니다', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteMenu(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menus'] })
      showToast('메뉴가 삭제되었습니다', 'success')
      setDeleteTargetId(null)
    },
    onError: () => showToast('삭제에 실패했습니다', 'error'),
  })

  const handleSubmit = (data: MenuFormData) => {
    if (editingMenu) {
      updateMutation.mutate({ id: editingMenu.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b px-4 py-4 flex items-center gap-3">
        <button
          data-testid="menu-manage-back"
          onClick={() => navigate('/admin/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-full min-h-[44px]"
        >
          ←
        </button>
        <h1 className="text-xl font-bold flex-1">메뉴 관리</h1>
        <button
          data-testid="menu-add-new"
          onClick={() => setEditingMenu(null)}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm min-h-[44px]"
        >
          + 메뉴 추가
        </button>
      </header>

      <div className="p-4">
        {editingMenu !== undefined ? (
          <div className="bg-white rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">{editingMenu ? '메뉴 수정' : '메뉴 등록'}</h2>
            <MenuForm
              menu={editingMenu}
              categories={categories}
              onSubmit={handleSubmit}
              onCancel={() => setEditingMenu(undefined)}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {menus.map((menu) => (
              <div key={menu.id} className="bg-white rounded-xl p-4 flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-semibold">{menu.name}</p>
                  <p className="text-sm text-gray-500">{menu.categoryName} · {menu.price.toLocaleString()}원</p>
                </div>
                <div className="flex gap-2">
                  <button
                    data-testid={`menu-edit-${menu.id}`}
                    onClick={() => setEditingMenu(menu)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 min-h-[44px]"
                  >
                    수정
                  </button>
                  <button
                    data-testid={`menu-delete-${menu.id}`}
                    onClick={() => setDeleteTargetId(menu.id)}
                    className="px-3 py-2 border border-red-300 text-red-500 rounded-lg text-sm hover:bg-red-50 min-h-[44px]"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        message="메뉴를 삭제하시겠습니까?"
        onConfirm={() => deleteTargetId && deleteMutation.mutate(deleteTargetId)}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  )
}
