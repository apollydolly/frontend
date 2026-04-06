import React, { useState, useEffect, useMemo } from "react";
import styles from "./Menu.module.scss";
import SimpleBar from "simplebar-react";
import Logo from "@icons/logo.svg";
import Photo from "@img/photo.png";
import Arrow from "@icons/small_arrow.svg?react";
import DashIcon from "@icons/dash.svg?react";
import BigSampleIcon from "@icons/big_sample.svg?react";
import VideoIcon from "@icons/video.svg?react";
import SettIcon from "@icons/sett.svg?react";
import HelpIcon from "@icons/help.svg?react";
import ListItemIcon from "@icons/list_item.svg?react";
import ListItemCurrIcon from "@icons/list_item_curr.svg?react";
import ListItemLastIcon from "@icons/list_item_last.svg?react";
import ListItemLastCurrIcon from "@icons/list_item_last_curr.svg?react";
import BackIcon from "@icons/back_arrow.svg?react";
import { SearchBox } from "@ui/shared/SearchBox";
import { Submenu } from "@ui/shared/Submenu";
import { ButtonGray } from "@ui/buttons/ButtonGray";

// тестовые данные
const mockTemplates = [
  { id: "template-1", title: "Шаблон 1", type: "template" },
  { id: "template-2", title: "Шаблон 2", type: "template" },
  { id: "template-3", title: "Шаблон 3", type: "template" },
  { id: "template-4", title: "Шаблон 4", type: "template" },
  { id: "template-5", title: "Шаблон 5", type: "template" },
  { id: "template-6", title: "Шаблон 6", type: "template" },
  { id: "template-7", title: "Шаблон 7", type: "template" },
  { id: "template-8", title: "Шаблон 8", type: "template" },
  { id: "template-9", title: "Шаблон 9", type: "template" },
];

export const menuItems = {
  main: [
    {
      id: "dashboards",
      title: "Мои дашборды",
      icon: DashIcon,
      component: "MyDashboards",
      hasSubmenu: true,
      subItems: [],
      type: "dashboards",
    },
    {
      id: "templates",
      title: "Готовые шаблоны",
      icon: BigSampleIcon,
      component: "Templates",
      hasSubmenu: true,
      subItems: mockTemplates,
      type: "templates",
    },
    {
      id: "videos",
      title: "Загруженные видео",
      icon: VideoIcon,
      component: "Videos",
    },
  ],
  other: [
    {
      id: "settings",
      title: "Настройки",
      icon: SettIcon,
      component: "Settings",
    },
    {
      id: "support",
      title: "Поддержка",
      icon: HelpIcon,
      component: "support",
    },
  ],
};

// Функция создания меню с дашбордами
export const createMenuItems = (dashboards = []) => ({
  main: [
    {
      ...menuItems.main[0], // dashboards
      subItems: dashboards,
    },
    ...menuItems.main.slice(1), // templates, videos
  ],
  other: menuItems.other,
});

export const Menu = ({
  activeItem,
  onMenuItemClick,
  onTemplateSelect,
  onDashboardSelect,
  onCreateDashboard,
  selectedTemplate,
  selectedDashboard,
  dashboards = [],
  isLoadingDashboards = false,
}) => {
  const [expandedItems, setExpandedItems] = useState({});
  const [currentView, setCurrentView] = useState("menu");
  const [searchQuery, setSearchQuery] = useState("");

  // Создаем меню на основе переданных дашбордов
  const menuItemsData = useMemo(() => {
    return createMenuItems(dashboards);
  }, [dashboards]);

  const templatesItem = menuItemsData.main.find(
    (item) => item.id === "templates"
  );
  const dashboardsItem = menuItemsData.main.find(
    (item) => item.id === "dashboards"
  );

  // Фильтруем элементы по поисковому запросу
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      if (currentView === "allTemplates") {
        return templatesItem.subItems;
      } else if (currentView === "allDashboards") {
        return dashboardsItem.subItems;
      }
      return [];
    }

    const items =
      currentView === "allTemplates"
        ? templatesItem.subItems
        : dashboardsItem.subItems;

    return items.filter((item) =>
      (item.title || item.name)
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [
    searchQuery,
    currentView,
    templatesItem.subItems,
    dashboardsItem.subItems,
  ]);

  // Закрываем другие подменю при открытии нового
  const toggleSubmenu = (itemId) => {
    setExpandedItems((prev) => {
      const newState = { ...prev };

      // Закрываем все другие подменю
      Object.keys(newState).forEach((key) => {
        if (key !== itemId) {
          newState[key] = false;
        }
      });

      // Раскрываем выбранное подменю
      newState[itemId] = true;
      return newState;
    });
  };

  useEffect(() => {
    // Автоматически раскрываем подменю в зависимости от активной страницы
    if (activeItem === "dashboards" && !expandedItems.dashboards) {
      setExpandedItems((prev) => ({ ...prev, dashboards: true }));
    } else if (activeItem === "templates" && !expandedItems.templates) {
      setExpandedItems((prev) => ({ ...prev, templates: true }));
    } else if (activeItem !== "dashboards" && activeItem !== "templates") {
      // Закрываем все подменю если активен не дашборд и не шаблоны
      setExpandedItems({ dashboards: false, templates: false });
    }
  }, [activeItem]);

  const handleMenuItemClick = (item) => {
    onMenuItemClick(item.id);

    // Автоматически раскрываем/закрываем подменю для дашбордов и шаблонов
    if (item.hasSubmenu) {
      // Если подменю уже раскрыто - закрываем его, если закрыто - раскрываем
      if (expandedItems[item.id]) {
        // Закрываем подменю при повторном клике
        setExpandedItems((prev) => ({ ...prev, [item.id]: false }));
      } else {
        // Раскрываем подменю и закрываем другие
        toggleSubmenu(item.id);
      }
    }
  };

  const handleShowAllTemplates = () => {
    setCurrentView("allTemplates");
    setSearchQuery("");
    setExpandedItems((prev) => ({ ...prev, dashboards: false }));
    onMenuItemClick("templates");
  };

  const handleShowAllDashboards = () => {
    setCurrentView("allDashboards");
    setSearchQuery("");
    setExpandedItems((prev) => ({ ...prev, templates: false }));
    onMenuItemClick("dashboards");
  };

  const handleBack = () => {
    setCurrentView("menu");
    setSearchQuery("");
  };

  const handleSearchFocus = (e) => {
    e.target.select();
  };

  // Рендер элемента списка с иконками
  const renderListItem = (item, isLast, isSelected, onClick) => {
    let ListIconComponent;
    if (isLast) {
      ListIconComponent = isSelected ? ListItemLastCurrIcon : ListItemLastIcon;
    } else {
      ListIconComponent = isSelected ? ListItemCurrIcon : ListItemIcon;
    }

    // Получаем название из title или name
    const itemName = item.title || item.name || "Без названия";

    return (
      <div
        key={`${item.type || "item"}-${
          item.dashboard_id || item.id || "unknown"
        }`}
        className={`${styles.submenuItem} ${isSelected ? styles.selected : ""}`}
        onClick={() => onClick(item)}
      >
        <ListIconComponent className={styles.listIcon} />
        <p>{itemName}</p>
      </div>
    );
  };

  // Обработчик выбора дашборда
  const handleDashboardSelect = (dashboard) => {
    console.log("Выбран дашборд в меню:", {
      id: dashboard.dashboard_id,
      name: dashboard.name,
      data: dashboard,
    });

    // Вызываем колбэк с данными дашборда
    onDashboardSelect(dashboard);
  };

  // Обработчик выбора шаблона
  const handleTemplateSelect = (template) => {
    console.log("Выбран шаблон:", template);
    onTemplateSelect(template);
  };

  // Рендер пункта меню с подменю
  const renderMenuItem = (item) => {
    const IconComponent = item.icon;
    const isExpanded = expandedItems[item.id];
    const isActive = activeItem === item.id;

    return (
      <React.Fragment key={item.id}>
        <div
          className={`${styles.menuItem} ${isActive ? styles.current : ""}`}
          onClick={() => handleMenuItemClick(item)}
        >
          <IconComponent className={styles.icon} />
          <p>{item.title}</p>
        </div>

        {isExpanded && (
          <Submenu
            key={`submenu-${item.id}`}
            item={item}
            isExpanded={isExpanded}
            selectedTemplate={selectedTemplate}
            selectedDashboard={selectedDashboard}
            onTemplateSelect={handleTemplateSelect}
            onDashboardSelect={handleDashboardSelect}
            onShowAllTemplates={handleShowAllTemplates}
            onShowAllDashboards={handleShowAllDashboards}
            onCreateDashboard={onCreateDashboard}
            renderListItem={renderListItem}
          />
        )}
      </React.Fragment>
    );
  };

  // Если показываем все шаблоны или дашборды - рендерим специальный вид
  if (currentView === "allTemplates" || currentView === "allDashboards") {
    const isTemplates = currentView === "allTemplates";
    const title = isTemplates ? "Готовые шаблоны" : "Мои дашборды";
    const subtitle = isTemplates
      ? "Готовые шаблоны дашбордов для ваших целей."
      : "Ваши созданные дашборды и аналитические панели.";
    const handleSelect = isTemplates
      ? handleTemplateSelect
      : handleDashboardSelect;
    const selectedItem = isTemplates ? selectedTemplate : selectedDashboard;

    return (
      <div className={styles.leftMenu}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <img src={Logo} alt="logo" />
            <div className={styles.logoText}>
              <h2>Smart Decision</h2>
              <h3>Система видеоаналитики</h3>
            </div>
          </div>
        </div>

        <div className={styles.main}>
          <div className={styles.readyTemplates}>
            <h2>{title}</h2>
            <h3>{subtitle}</h3>
          </div>
          <SearchBox
            placeholder={isTemplates ? "Поиск шаблонов" : "Поиск дашбордов"}
            value={searchQuery}
            onChange={setSearchQuery}
            onFocus={handleSearchFocus}
          />
          <SimpleBar
            className={styles.simplebarContainer}
            style={{
              width: "292px",
              height: "735px",
            }}
            forceVisible="y"
          >
            <div className={styles.mainMenu}>
              <div className={styles.allTemplatesSection}>
                {!isLoadingDashboards && filteredItems.length > 0 ? (
                  <div className={styles.allTemplatesList}>
                    {filteredItems.map((item, index) =>
                      renderListItem(
                        item,
                        index === filteredItems.length - 1,
                        isTemplates
                          ? selectedItem?.id === item.id
                          : selectedItem?.dashboard_id === item.dashboard_id,
                        handleSelect
                      )
                    )}
                  </div>
                ) : (
                  <div className={styles.noResults}>
                    <p>{isTemplates ? "Шаблоны" : "Дашборды"} не найдены</p>
                  </div>
                )}
              </div>
            </div>
          </SimpleBar>
          <ButtonGray text="Назад" onClick={handleBack} />
        </div>
      </div>
    );
  }

  // Обычный режим меню
  return (
    <div className={styles.leftMenu}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <img src={Logo} alt="logo" />
          <div className={styles.logoText}>
            <h2>Smart Decision</h2>
            <h3>Система видеоаналитики</h3>
          </div>
        </div>
      </div>
      <div className={styles.main}>
        <div className={styles.account}>
          <div className={styles.accountInfo}>
            <img src={Photo} alt="photo" />
            <div className={styles.name}>
              <h2>Эгамова Анна</h2>
              <h3>Тестовый аккаунт</h3>
            </div>
          </div>
          <Arrow className={styles.icon} />
        </div>

        <div className={styles.mainMenu}>
          <p className={styles.title}>Главное меню</p>
          <div className={styles.menuList}>
            {menuItemsData.main.map(renderMenuItem)}
          </div>
        </div>

        <div className={`${styles.mainMenu} ${styles.other}`}>
          <p className={styles.title}>Другое</p>
          <div className={styles.menuList}>
            {menuItemsData.other.map(renderMenuItem)}
          </div>
        </div>
      </div>
    </div>
  );
};
