# Frontend Components - Functional Design

---

## 라우터 구조

```
App
 +-- AuthProvider (테이블/관리자 인증 상태)
      +-- CartProvider (장바구니 상태)
           +-- Router
                +-- / -> 자동 리다이렉트 (토큰 여부에 따라)
                +-- /setup -> TableSetupPage (초기 설정)
                +-- /menu -> MenuPage (고객 기본 화면)
                +-- /orders -> CustomerOrderHistoryPage
                +-- /admin/login -> AdminLoginPage
                +-- /admin/dashboard -> DashboardPage (SseProvider 포함)
                +-- /admin/menus -> MenuManagePage
                +-- /admin/orders/history -> AdminOrderHistoryPage
```

---

## Customer Components

### TableSetupPage
- **Props**: 없음
- **State**: `storeIdentifier`, `tableNumber`, `password` (form 입력값)
- **동작**: 폼 제출 → `AuthContext.setupTable()` → 성공 시 `/menu` 이동
- **API**: `POST /api/tables/login`

---

### MenuPage
- **Props**: 없음
- **State**: `selectedCategoryId`, `isCartDrawerOpen`
- **자식**: `CategoryTabs`, `MenuGrid`, `CartDrawer`, `CartFab`
- **API**: `GET /api/menus/categories`, `GET /api/menus?categoryId={id}`

#### CategoryTabs
- **Props**: `categories: MenuCategory[]`, `selectedId: number`, `onSelect: (id) => void`
- **동작**: 탭 클릭 → `onSelect` 호출

#### MenuGrid
- **Props**: `menus: Menu[]`, `onAddToCart: (menu) => void`
- **자식**: `MenuCard[]`

#### MenuCard
- **Props**: `menu: Menu`, `cartQuantity: number`, `onAdd: () => void`
- **동작**: "담기" 버튼 → `CartContext.addItem()`
- **표시**: 이미 담긴 경우 수량 배지 표시

#### CartFab (Floating Action Button)
- **Props**: `itemCount: number`, `totalAmount: number`, `onClick: () => void`
- **동작**: 클릭 → CartDrawer 열기
- **표시**: 장바구니 비어있으면 숨김

#### CartDrawer
- **Props**: `isOpen: boolean`, `onClose: () => void`
- **State**: 없음 (CartContext에서 읽음)
- **자식**: `CartItem[]`, `CartSummary`
- **동작**: 외부 클릭/닫기 버튼 → `onClose()`

#### CartItem
- **Props**: `item: CartItem`, `onIncrease: () => void`, `onDecrease: () => void`
- **동작**: +/- 버튼 → `CartContext.updateQuantity()`

#### CartSummary
- **Props**: `totalAmount: number`, `onOrder: () => void`, `onClear: () => void`
- **동작**: "주문하기" → `/order/confirm` 이동, "비우기" → ConfirmDialog

---

### OrderConfirmPage
- **Props**: 없음
- **State**: `isSubmitting`, `orderResult`, `countdown`
- **동작**:
  - 마운트 시 CartContext에서 items 읽어 표시
  - "주문 확정" → `POST /api/orders` → 성공 시 countdown 시작
  - countdown 0 → `/menu` 이동 + 장바구니 비우기
- **API**: `POST /api/orders`

---

### CustomerOrderHistoryPage
- **Props**: 없음
- **State**: `orders: Order[]`, `isLoading`
- **자식**: `OrderHistoryItem[]`
- **API**: `GET /api/orders/session`

#### OrderHistoryItem
- **Props**: `order: Order`
- **자식**: `OrderStatusBadge`

#### OrderStatusBadge
- **Props**: `status: OrderStatus`
- **표시**: PENDING="대기중"(노란색), PREPARING="준비중"(파란색), COMPLETED="완료"(초록색)

---

## Admin Components

### AdminLoginPage
- **Props**: 없음
- **State**: `storeIdentifier`, `username`, `password`, `error`
- **동작**: 폼 제출 → `AuthContext.adminLogin()` → 성공 시 `/admin/dashboard`
- **API**: `POST /api/auth/login`

---

### DashboardPage
- **Props**: 없음
- **State**: SseContext에서 `tableOrderSummaries` 읽음
- **자식**: `SseProvider`, `TableGrid`, `OrderDetailModal`
- **동작**: 마운트 시 초기 데이터 로드 + SSE 연결
- **API**: `GET /api/orders/table/{tableId}` (초기 로드)

#### TableGrid
- **Props**: `summaries: TableOrderSummary[]`
- **자식**: `TableCard[]`
- **레이아웃**: 반응형 그리드 (1/2/3/4열)

#### TableCard
- **Props**: `summary: TableOrderSummary`, `isNew: boolean`, `onClick: () => void`
- **표시**: 테이블 번호, 총 주문액, 최신 주문 2개 미리보기
- **동작**: 클릭 → `OrderDetailModal` 열기
- **스타일**: `isNew=true` 시 강조 색상 + 애니메이션

#### OrderDetailModal
- **Props**: `tableId: number | null`, `onClose: () => void`
- **State**: `orders: Order[]` (SseContext에서 읽음)
- **자식**: `OrderDetailItem[]`, `TableActionButtons`
- **동작**: 열릴 때 해당 테이블 강조 해제

#### OrderDetailItem
- **Props**: `order: Order`, `onStatusChange: (status) => void`, `onDelete: () => void`
- **자식**: `OrderStatusControl`
- **API**: `PATCH /api/orders/{id}/status`, `DELETE /api/orders/{id}`

#### OrderStatusControl
- **Props**: `currentStatus: OrderStatus`, `onChange: (status) => void`
- **동작**: 상태 버튼 클릭 → API 호출 → Toast 표시

#### TableActionButtons
- **Props**: `tableId: number`, `onComplete: () => void`
- **동작**: "이용 완료" → ConfirmDialog → `POST /api/tables/{id}/complete`

---

### MenuManagePage
- **Props**: 없음
- **State**: `menus: Menu[]`, `categories: MenuCategory[]`, `editingMenu: Menu | null`, `isFormOpen`
- **자식**: `MenuManageList`, `MenuForm`, `ConfirmDialog`
- **API**: `GET /api/menus`, `POST /api/menus`, `PUT /api/menus/{id}`, `DELETE /api/menus/{id}`

#### MenuForm
- **Props**: `menu: Menu | null` (null이면 등록, 있으면 수정), `categories: MenuCategory[]`, `onSubmit: (data) => void`, `onCancel: () => void`
- **State**: form 입력값들
- **검증**: BR-VALID-01 규칙 적용

---

### AdminOrderHistoryPage
- **Props**: 없음
- **State**: `tableId`, `fromDate`, `toDate`, `histories: OrderHistory[]`
- **자식**: `DateRangePicker`, `OrderHistoryList`
- **API**: `GET /api/tables/{id}/history?from={date}&to={date}`

---

## 공통 Components

### ConfirmDialog
- **Props**: `isOpen: boolean`, `message: string`, `onConfirm: () => void`, `onCancel: () => void`
- **용도**: 삭제/이용완료 등 확인이 필요한 액션

### Toast
- **Props**: `message: string`, `type: 'success' | 'error' | 'info'`
- **동작**: 3초 후 자동 사라짐
- **위치**: 화면 하단 중앙

### ErrorModal
- **Props**: `isOpen: boolean`, `message: string`, `onClose: () => void`
- **용도**: 주문 실패, 네트워크 오류 등 중요 에러
