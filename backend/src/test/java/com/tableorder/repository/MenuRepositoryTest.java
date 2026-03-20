package com.tableorder.repository;

import com.tableorder.entity.Menu;
import com.tableorder.entity.MenuCategory;
import com.tableorder.entity.Store;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class MenuRepositoryTest {

    @Autowired MenuRepository menuRepository;
    @Autowired MenuCategoryRepository menuCategoryRepository;
    @Autowired StoreRepository storeRepository;

    private Store store;
    private MenuCategory category;

    @BeforeEach
    void setUp() {
        store = storeRepository.save(Store.builder()
                .storeIdentifier("store001").name("테스트 매장")
                .adminUsername("admin").adminPassword("pw").build());
        category = menuCategoryRepository.save(MenuCategory.builder()
                .store(store).name("음료").displayOrder(1).build());
    }

    // TC-BE-036
    @Test
    @DisplayName("Soft Delete된 메뉴는 조회 결과에서 제외")
    void findByStoreId_excludesDeletedMenus() {
        Menu active = menuRepository.save(Menu.builder()
                .store(store).category(category).name("아메리카노")
                .price(4000).description(null).imageUrl(null).displayOrder(1).build());
        Menu deleted = menuRepository.save(Menu.builder()
                .store(store).category(category).name("삭제메뉴")
                .price(3000).description(null).imageUrl(null).displayOrder(2).build());
        deleted.softDelete();
        menuRepository.save(deleted);

        List<Menu> result = menuRepository.findByStoreIdAndIsDeletedFalseOrderByDisplayOrder(store.getId());

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("아메리카노");
    }

    // TC-BE-037
    @Test
    @DisplayName("메뉴 목록 displayOrder 오름차순 정렬")
    void findByStoreId_orderedByDisplayOrder() {
        menuRepository.save(Menu.builder().store(store).category(category)
                .name("C메뉴").price(3000).description(null).imageUrl(null).displayOrder(3).build());
        menuRepository.save(Menu.builder().store(store).category(category)
                .name("A메뉴").price(1000).description(null).imageUrl(null).displayOrder(1).build());
        menuRepository.save(Menu.builder().store(store).category(category)
                .name("B메뉴").price(2000).description(null).imageUrl(null).displayOrder(2).build());

        List<Menu> result = menuRepository.findByStoreIdAndIsDeletedFalseOrderByDisplayOrder(store.getId());

        assertThat(result).extracting(Menu::getName)
                .containsExactly("A메뉴", "B메뉴", "C메뉴");
    }
}
