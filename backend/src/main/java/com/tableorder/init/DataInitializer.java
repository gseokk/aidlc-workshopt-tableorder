package com.tableorder.init;

import com.tableorder.entity.Menu;
import com.tableorder.entity.MenuCategory;
import com.tableorder.entity.Store;
import com.tableorder.entity.TableEntity;
import com.tableorder.repository.MenuCategoryRepository;
import com.tableorder.repository.MenuRepository;
import com.tableorder.repository.StoreRepository;
import com.tableorder.repository.TableRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final StoreRepository storeRepository;
    private final TableRepository tableRepository;
    private final MenuCategoryRepository menuCategoryRepository;
    private final MenuRepository menuRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.username:admin}")
    private String adminUsername;

    @Value("${admin.password:admin1234}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        Store store = initStore();
        initTables(store);
        initMenus(store);
    }

    private Store initStore() {
        return storeRepository.findByStoreIdentifier("store001").orElseGet(() -> {
            Store store = Store.builder()
                    .storeIdentifier("store001")
                    .name("테이블오더 매장")
                    .adminUsername(adminUsername)
                    .adminPassword(passwordEncoder.encode(adminPassword))
                    .build();
            Store saved = storeRepository.save(store);
            log.info("초기 매장 데이터 생성: store001");
            return saved;
        });
    }

    private void initTables(Store store) {
        for (int i = 1; i <= 10; i++) {
            final int tableNum = i;
            if (tableRepository.findByStoreIdAndTableNumber(store.getId(), tableNum).isEmpty()) {
                tableRepository.save(TableEntity.builder()
                        .store(store).tableNumber(tableNum).password("1234").build());
            }
        }
        log.info("초기 테이블 데이터 확인 완료: 1~10번 (비밀번호: 1234)");
    }

    private void initMenus(Store store) {
        if (menuCategoryRepository.countByStoreId(store.getId()) > 0) return;

        // 카테고리 1: 한식
        MenuCategory korean = save(MenuCategory.builder().store(store).name("한식").displayOrder(1).build());
        saveMenu(store, korean, "김치찌개",     9000, "묵은지와 돼지고기로 끓인 얼큰한 찌개", 1);
        saveMenu(store, korean, "된장찌개",     8500, "구수한 된장과 두부, 애호박 찌개",       2);
        saveMenu(store, korean, "비빔밥",      10000, "신선한 나물과 고추장 비빔밥",           3);
        saveMenu(store, korean, "불고기",      13000, "달콤한 양념 소불고기",                  4);
        saveMenu(store, korean, "제육볶음",    11000, "매콤한 돼지고기 볶음",                  5);

        // 카테고리 2: 분식
        MenuCategory snack = save(MenuCategory.builder().store(store).name("분식").displayOrder(2).build());
        saveMenu(store, snack, "떡볶이",       6000, "쫄깃한 떡과 어묵 매운 소스",            1);
        saveMenu(store, snack, "순대",         5000, "당면 가득 순대 한 접시",                 2);
        saveMenu(store, snack, "튀김 모둠",    7000, "새우·고구마·야채 튀김 모둠",             3);
        saveMenu(store, snack, "라볶이",       7500, "라면과 떡볶이의 조합",                   4);

        // 카테고리 3: 음료
        MenuCategory drinks = save(MenuCategory.builder().store(store).name("음료").displayOrder(3).build());
        saveMenu(store, drinks, "아메리카노",   4500, "진한 에스프레소 아메리카노",             1);
        saveMenu(store, drinks, "카페라떼",    5000, "부드러운 우유 라떼",                     2);
        saveMenu(store, drinks, "오렌지주스",  4000, "신선한 오렌지 착즙",                     3);
        saveMenu(store, drinks, "콜라",        2500, "시원한 탄산음료",                        4);
        saveMenu(store, drinks, "맥주 (500)",  5500, "시원한 생맥주 500cc",                    5);

        // 카테고리 4: 사이드
        MenuCategory side = save(MenuCategory.builder().store(store).name("사이드").displayOrder(4).build());
        saveMenu(store, side, "공기밥",        1000, "따뜻한 공기밥",                          1);
        saveMenu(store, side, "계란말이",      5000, "부드러운 계란말이",                      2);
        saveMenu(store, side, "김치",          1000, "잘 익은 포기김치",                       3);
        saveMenu(store, side, "콘치즈",        4500, "달콤한 콘치즈 구이",                     4);

        log.info("초기 메뉴 데이터 생성: 4개 카테고리, 18개 메뉴");
    }

    private MenuCategory save(MenuCategory category) {
        return menuCategoryRepository.save(category);
    }

    private void saveMenu(Store store, MenuCategory category, String name, int price, String desc, int order) {
        menuRepository.save(Menu.builder()
                .store(store).category(category)
                .name(name).price(price).description(desc).displayOrder(order)
                .build());
    }
}
