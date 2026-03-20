import { useState } from 'react'
import type { Menu, MenuCategory, MenuFormData } from '@/types'

interface Props {
  menu: Menu | null
  categories: MenuCategory[]
  onSubmit: (data: MenuFormData) => void
  onCancel: () => void
}

interface FormErrors {
  name?: string
  categoryId?: string
  price?: string
  imageUrl?: string
}

export function MenuForm({ menu, categories, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(menu?.name ?? '')
  const [categoryId, setCategoryId] = useState<number>(menu?.categoryId ?? 0)
  const [price, setPrice] = useState<string>(menu?.price.toString() ?? '')
  const [description, setDescription] = useState(menu?.description ?? '')
  const [imageUrl, setImageUrl] = useState(menu?.imageUrl ?? '')
  const [errors, setErrors] = useState<FormErrors>({})

  const validate = (): boolean => {
    const next: FormErrors = {}
    if (!name.trim()) next.name = '메뉴명을 입력해 주세요'
    else if (name.length > 100) next.name = '메뉴명은 100자 이하여야 합니다'
    if (!categoryId) next.categoryId = '카테고리를 선택해 주세요'
    const priceNum = Number(price)
    if (!price || isNaN(priceNum) || priceNum < 0 || !Number.isInteger(priceNum)) {
      next.price = '가격은 0 이상의 정수여야 합니다'
    }
    if (imageUrl && !/^https?:\/\/.+/.test(imageUrl)) {
      next.imageUrl = '올바른 URL 형식이 아닙니다'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      name: name.trim(),
      categoryId,
      price: Number(price),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">메뉴명 *</label>
        <input
          data-testid="menu-form-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="메뉴명 입력"
        />
        {errors.name && <p data-testid="menu-form-name-error" className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">카테고리 *</label>
        <select
          data-testid="menu-form-category"
          value={categoryId}
          onChange={(e) => setCategoryId(Number(e.target.value))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value={0}>카테고리 선택</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {errors.categoryId && <p data-testid="menu-form-category-error" className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">가격 *</label>
        <input
          data-testid="menu-form-price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="0"
          min={0}
        />
        {errors.price && <p data-testid="menu-form-price-error" className="text-red-500 text-sm mt-1">{errors.price}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
        <textarea
          data-testid="menu-form-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          rows={3}
          maxLength={500}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">이미지 URL</label>
        <input
          data-testid="menu-form-image-url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="https://..."
        />
        {errors.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.imageUrl}</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 min-h-[44px]"
        >
          취소
        </button>
        <button
          data-testid="menu-form-submit"
          type="submit"
          className="flex-1 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 min-h-[44px]"
        >
          {menu ? '수정' : '등록'}
        </button>
      </div>
    </form>
  )
}
