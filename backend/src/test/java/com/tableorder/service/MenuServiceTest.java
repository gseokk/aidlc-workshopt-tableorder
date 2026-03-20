package com.tableorder.service;

import com.tableorder.dto.request.MenuCreateRequest;
import com.tableorder.dto.response.MenuResponse;
import com.tableorder.entity.Menu;
import com.tableorder.entity.MenuCategory;
import com.tableorder.entity.Store;
import com.tableorder.exception.NotFoundException;
import com.tableorder.repository.MenuCategoryRepository;
import com.tableorder.repository.MenuRepository;
import com.tableorder.repository.StoreRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
class MenuServiceTest {

    @Mock MenuRepository menuRepository;
    @Mock MenuCategoryRepository menuCategoryRepository;
    @Mock StoreRepository storeRepository;

    @InjectMocks MenuService menuService;

    private Store store;
    private MenuCategory category;
    private Menu menu;

    @BeforeEach
    void setUp() {
        store = Store.builder()
                .storeIdentifier("store001").name("테스트 매장")
                .adminUsername("admin").adminPassword("pw").build();

        category = MenuCategory.builder().store(store).name("음료").displayOrder(1).build();

        menu = Menu.builder()
                .store(store).category(category)
                .name("아메리카노").price(4000)
                .description("진한 커피").imageUrl(null).displayOrder(1)
                .build();
    }

    // TC-BE-011
    @Test
    @DisplayName("신규 카테고리로 메뉴 등록 - 카테고리 자동 생성")
    void createMenu_newCategory_created() {
        given(menuCategoryRepository.findByStoreIdAndName(any(), eq("신규카테고리")))
                .willReturn(Optional.empty());
        given(menuCategoryRepository.countByStoreId(any())).willReturn(0L);
        given(menuCategoryRepository.save(any())).willReturn(category);
        given(storeRepository.getReferenceById(any())).willReturn(store);
        given(menuRepository.countByCategoryIdAndIsDeletedFalse(any())).willReturn(0L);
        given(menuRepository.save(any())).willReturn(menu);

        MenuCreateRequest request = new MenuCreateRequest("아메리카노", 4000, "신규카테고리", null, null);
        MenuResponse response = menuService.createMenu(1L, request);

        assertThat(response.name()).isEqualTo("아메리카노");
        then(menuCategoryRepository).should().save(any(MenuCategory.class));
    }

    // TC-BE-012
    @Test
    @DisplayName("기존 카테고리로 메뉴 등록 - 카테고리 재사용")
    void createMenu_existingCategory_reused() {
        given(menuCategoryRepository.findByStoreIdAndName(any(), eq("음료")))
                .willReturn(Optional.of(category));
        given(storeRepository.getReferenceById(any())).willReturn(store);
        given(menuRepository.countByCategoryIdAndIsDeletedFalse(any())).willReturn(2L);
        given(menuRepository.save(any())).willReturn(menu);

        MenuCreateRequest request = new MenuCreateRequest("아메리카노", 4000, "음료", null, null);
        menuService.createMenu(1L, request);

        then(menuCategoryRepository).should(never()).save(any());
    }

    // TC-BE-013
    @Test
    @DisplayName("메뉴 Soft Delete")
    void deleteMenu_softDelete() {
        given(menuRepository.findByIdAndStoreId(1L, 1L)).willReturn(Optional.of(menu));

        menuService.deleteMenu(1L, 1L);

        assertThat(menu.getIsDeleted()).isTrue();
        then(menuRepository).should().save(menu);
    }

    // TC-BE-014
    @Test
    @DisplayName("존재하지 않는 메뉴 삭제 시 NotFoundException")
    void deleteMenu_notFound_throwsException() {
        given(menuRepository.findByIdAndStoreId(99L, 1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> menuService.deleteMenu(1L, 99L))
                .isInstanceOf(NotFoundException.class);
    }

    // TC-BE-015
    @Test
    @DisplayName("메뉴 순서 변경 시 일괄 재정렬")
    void updateMenuOrder_reordered() {
        Menu menu1 = Menu.builder().store(store).category(category)
                .name("A").price(1000).description(null).imageUrl(null).displayOrder(1).build();
        Menu menu2 = Menu.builder().store(store).category(category)
                .name("B").price(2000).description(null).imageUrl(null).displayOrder(2).build();
        Menu menu3 = Menu.builder().store(store).category(category)
                .name("C").price(3000).description(null).imageUrl(null).displayOrder(3).build();

        given(menuRepository.findByIdAndStoreId(any(), any())).willReturn(Optional.of(menu2));
        given(menuRepository.findByCategoryIdAndIsDeletedFalseOrderByDisplayOrder(any()))
                .willReturn(List.of(menu1, menu2, menu3));

        menuService.updateMenuOrder(1L, 2L, 1);

        then(menuRepository).should().saveAll(anyList());
    }
}
