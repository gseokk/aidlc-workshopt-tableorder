package com.tableorder.service;

import com.tableorder.dto.request.MenuCreateRequest;
import com.tableorder.dto.request.MenuUpdateRequest;
import com.tableorder.dto.response.CategoryResponse;
import com.tableorder.dto.response.MenuResponse;
import com.tableorder.entity.Menu;
import com.tableorder.entity.MenuCategory;
import com.tableorder.entity.Store;
import com.tableorder.exception.NotFoundException;
import com.tableorder.repository.MenuCategoryRepository;
import com.tableorder.repository.MenuRepository;
import com.tableorder.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuRepository menuRepository;
    private final MenuCategoryRepository menuCategoryRepository;
    private final StoreRepository storeRepository;

    @Transactional(readOnly = true)
    public List<MenuResponse> getMenusByCategory(Long storeId, Long categoryId) {
        List<Menu> menus = categoryId == null
                ? menuRepository.findByStoreIdAndIsDeletedFalseOrderByDisplayOrder(storeId)
                : menuRepository.findByStoreIdAndCategoryIdAndIsDeletedFalseOrderByDisplayOrder(storeId, categoryId);
        return menus.stream().map(MenuResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategories(Long storeId) {
        return menuCategoryRepository.findByStoreIdOrderByDisplayOrder(storeId)
                .stream().map(CategoryResponse::from).toList();
    }

    @Transactional
    public MenuResponse createMenu(Long storeId, MenuCreateRequest request) {
        Store store = storeRepository.getReferenceById(storeId);
        MenuCategory category = findOrCreateCategory(storeId, request.categoryName(), store);
        long count = menuRepository.countByCategoryIdAndIsDeletedFalse(category.getId());
        Menu menu = menuRepository.save(Menu.builder()
                .store(store).category(category)
                .name(request.name()).price(request.price())
                .description(request.description()).imageUrl(request.imageUrl())
                .displayOrder((int) count + 1)
                .build());
        return MenuResponse.from(menu);
    }

    @Transactional
    public MenuResponse updateMenu(Long storeId, Long menuId, MenuUpdateRequest request) {
        Menu menu = menuRepository.findByIdAndStoreId(menuId, storeId)
                .filter(m -> !m.getIsDeleted())
                .orElseThrow(() -> new NotFoundException("메뉴를 찾을 수 없습니다"));
        Store store = storeRepository.getReferenceById(storeId);
        MenuCategory category = findOrCreateCategory(storeId, request.categoryName(), store);
        menu.update(category, request.name(), request.price(), request.description(), request.imageUrl());
        return MenuResponse.from(menuRepository.save(menu));
    }

    @Transactional
    public void deleteMenu(Long storeId, Long menuId) {
        Menu menu = menuRepository.findByIdAndStoreId(menuId, storeId)
                .orElseThrow(() -> new NotFoundException("메뉴를 찾을 수 없습니다"));
        menu.softDelete();
        menuRepository.save(menu);
    }

    @Transactional
    public void updateMenuOrder(Long storeId, Long menuId, Integer newOrder) {
        Menu target = menuRepository.findByIdAndStoreId(menuId, storeId)
                .orElseThrow(() -> new NotFoundException("메뉴를 찾을 수 없습니다"));

        List<Menu> menus = new ArrayList<>(
                menuRepository.findByCategoryIdAndIsDeletedFalseOrderByDisplayOrder(target.getCategory().getId()));

        menus.remove(target);
        int insertIdx = Math.min(newOrder - 1, menus.size());
        menus.add(insertIdx, target);

        for (int i = 0; i < menus.size(); i++) {
            menus.get(i).updateDisplayOrder(i + 1);
        }
        menuRepository.saveAll(menus);
    }

    private MenuCategory findOrCreateCategory(Long storeId, String categoryName, Store store) {
        return menuCategoryRepository.findByStoreIdAndName(storeId, categoryName)
                .orElseGet(() -> {
                    long order = menuCategoryRepository.countByStoreId(storeId);
                    return menuCategoryRepository.save(
                            MenuCategory.builder().store(store).name(categoryName)
                                    .displayOrder((int) order + 1).build());
                });
    }
}
