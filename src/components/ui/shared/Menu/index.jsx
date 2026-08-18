import React, { useState, useEffect, useMemo, useRef } from "react";
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
import { SearchBox } from "@ui/shared/SearchBox";
import { Submenu } from "@ui/shared/Submenu";
import { ButtonGray } from "@ui/buttons/ButtonGray";

// тестовые данные
const mockDashboards = [
  { dashboard_id: "dashboard-1", title: "Дашборд 1", type: "dashboard" },
  { dashboard_id: "dashboard-2", title: "Дашборд 2", type: "dashboard" },
  { dashboard_id: "dashboard-3", title: "Дашборд 3", type: "dashboard" },
  { dashboard_id: "dashboard-4", title: "Дашборд 4", type: "dashboard" },
  { dashboard_id: "dashboard-5", title: "Дашборд 5", type: "dashboard" },
  { dashboard_id: "dashboard-6", title: "Дашборд 6", type: "dashboard" },
  { dashboard_id: "dashboard-1", title: "Дашборд 1", type: "dashboard" },
  { dashboard_id: "dashboard-2", title: "Дашборд 2", type: "dashboard" },
  { dashboard_id: "dashboard-3", title: "Дашборд 3", type: "dashboard" },
  { dashboard_id: "dashboard-4", title: "Дашборд 4", type: "dashboard" },
  { dashboard_id: "dashboard-5", title: "Дашборд 5", type: "dashboard" },
  { dashboard_id: "dashboard-6", title: "Дашборд 6", type: "dashboard" },
  { dashboard_id: "dashboard-1", title: "Дашборд 1", type: "dashboard" },
  { dashboard_id: "dashboard-2", title: "Дашборд 2", type: "dashboard" },
  { dashboard_id: "dashboard-3", title: "Дашборд 3", type: "dashboard" },
  { dashboard_id: "dashboard-4", title: "Дашборд 4", type: "dashboard" },
  { dashboard_id: "dashboard-5", title: "Дашборд 5", type: "dashboard" },
  { dashboard_id: "dashboard-6", title: "Дашборд 6", type: "dashboard" },
  { dashboard_id: "dashboard-1", title: "Дашборд 1", type: "dashboard" },
  { dashboard_id: "dashboard-2", title: "Дашборд 2", type: "dashboard" },
  { dashboard_id: "dashboard-3", title: "Дашборд 3", type: "dashboard" },
  { dashboard_id: "dashboard-4", title: "Дашборд 4", type: "dashboard" },
  { dashboard_id: "dashboard-5", title: "Дашборд 5", type: "dashboard" },
  { dashboard_id: "dashboard-6", title: "Дашборд 6", type: "dashboard" },
  { dashboard_id: "dashboard-1", title: "Дашборд 1", type: "dashboard" },
  { dashboard_id: "dashboard-2", title: "Дашборд 2", type: "dashboard" },
  { dashboard_id: "dashboard-3", title: "Дашборд 3", type: "dashboard" },
  { dashboard_id: "dashboard-4", title: "Дашборд 4", type: "dashboard" },
  { dashboard_id: "dashboard-5", title: "Дашборд 5", type: "dashboard" },
  { dashboard_id: "dashboard-6", title: "Дашборд 6", type: "dashboard" },
];

const mockTemplates = [
  { id: "template-1", title: "Шаблон 1", type: "template" },
  { id: "template-2", title: "Шаблон 2", type: "template" },
  { id: "template-3", title: "Шаблон 3", type: "template" },
  { id: "template-4", title: "Шаблон 4", type: "template" },
  { id: "template-5", title: "Шаблон 5", type: "template" },
  { id: "template-6", title: "Шаблон 6", type: "template" },
];

const mockScenarios = [
  { id: "scenario-1", title: "Сценарий 1", type: "scenario" },
  { id: "scenario-2", title: "Сценарий 2", type: "scenario" },
  { id: "scenario-3", title: "Сценарий 3", type: "scenario" },
  { id: "scenario-4", title: "Сценарий 4", type: "scenario" },
  { id: "scenario-5", title: "Сценарий 5", type: "scenario" },
  { id: "scenario-6", title: "Сценарий 6", type: "scenario" },
];

export const menuItems = {
  main: [
    {
      id: "dashboards",
      title: "Мои дашборды",
      icon: DashIcon,
      component: "MyDashboards",
      hasSubmenu: true,
      subItems: mockDashboards,
      type: "dashboards",
      maxVisibleItems: 1,
    },
    {
      id: "templates",
      title: "Готовые шаблоны",
      icon: BigSampleIcon,
      component: "Templates",
      hasSubmenu: true,
      subItems: mockTemplates,
      type: "templates",
      maxVisibleItems: 2,
    },
    {
      id: "my-scenarios",
      title: "Мои сценарии",
      icon: DashIcon,
      component: [],
      hasSubmenu: false,
      subItems: [],
      type: "my-scenarios",
      disabled: true,
    },
    {
      id: "scenarios",
      title: "Готовые сценарии",
      icon: BigSampleIcon,
      component: "Templates",
      hasSubmenu: true,
      subItems: mockScenarios,
      type: "scenarios",
      maxVisibleItems: 2,
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

export const createMenuItems = (dashboards = [], myScenarios = []) => ({
  main: [
    dashboards.length
      ? { ...menuItems.main[0], subItems: dashboards }
      : menuItems.main[0], // оставляем моковые данные
    menuItems.main[1],
    { ...menuItems.main[2], subItems: myScenarios },
    menuItems.main[3],
    ...menuItems.main.slice(4),
  ],
  other: menuItems.other,
});

export const Menu = ({
  activeItem,
  onMenuItemClick,
  onTemplateSelect,
  onDashboardSelect,
  onScenarioSelect,
  onMyScenarioSelect,
  onCreateDashboard,
  onCreateScenario,
  selectedTemplate,
  selectedDashboard,
  selectedScenario,
  selectedMyScenario,
  dashboards = [],
  myScenarios = [],
  isLoadingDashboards = false,
  isLoadingMyScenarios = false,
}) => {
  const [expandedItems, setExpandedItems] = useState({});
  const [currentView, setCurrentView] = useState("menu");
  const [searchQuery, setSearchQuery] = useState("");
  const prevActiveItemRef = useRef(null);

  const menuItemsData = useMemo(() => {
    return createMenuItems(dashboards, myScenarios);
  }, [dashboards, myScenarios]);

  const templatesItem = menuItemsData.main.find(
    (item) => item.id === "templates",
  );
  const dashboardsItem = menuItemsData.main.find(
    (item) => item.id === "dashboards",
  );
  const scenariosItem = menuItemsData.main.find(
    (item) => item.id === "scenarios",
  );
  const myScenariosItem = menuItemsData.main.find(
    (item) => item.id === "my-scenarios",
  );

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      if (currentView === "allTemplates") return templatesItem?.subItems || [];
      if (currentView === "allDashboards")
        return dashboardsItem?.subItems || [];
      if (currentView === "allScenarios") return scenariosItem?.subItems || [];
      if (currentView === "allMyScenarios")
        return myScenariosItem?.subItems || [];
      return [];
    }
    let items = [];
    if (currentView === "allTemplates") items = templatesItem?.subItems || [];
    else if (currentView === "allDashboards")
      items = dashboardsItem?.subItems || [];
    else if (currentView === "allScenarios")
      items = scenariosItem?.subItems || [];
    else if (currentView === "allMyScenarios")
      items = myScenariosItem?.subItems || [];
    else return [];

    return items.filter((item) =>
      (item.title || item.name)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
    );
  }, [
    searchQuery,
    currentView,
    templatesItem,
    dashboardsItem,
    scenariosItem,
    myScenariosItem,
  ]);

  // Синхронизация подменю с активным пунктом при смене страницы
  useEffect(() => {
    if (prevActiveItemRef.current !== activeItem) {
      const item = menuItemsData.main.find((i) => i.id === activeItem);
      if (item?.hasSubmenu) {
        setExpandedItems({ [activeItem]: true });
      } else {
        setExpandedItems({});
      }
      prevActiveItemRef.current = activeItem;
    }
  }, [activeItem, menuItemsData.main]);

  const handleMenuItemClick = (item) => {
    if (item.disabled) return;
    onMenuItemClick(item.id);
    if (item.hasSubmenu) {
      setExpandedItems((prev) => {
        if (prev[item.id]) {
          // Если подменю открыто – закрываем его
          return {};
        } else {
          // Если закрыто – открываем, закрывая все остальные
          return { [item.id]: true };
        }
      });
    }
  };

  const handleShowAllTemplates = () => {
    setCurrentView("allTemplates");
    setSearchQuery("");
    setExpandedItems({});
    onMenuItemClick("templates");
  };

  const handleShowAllDashboards = () => {
    setCurrentView("allDashboards");
    setSearchQuery("");
    setExpandedItems({});
    onMenuItemClick("dashboards");
  };

  const handleShowAllScenarios = () => {
    setCurrentView("allScenarios");
    setSearchQuery("");
    setExpandedItems({});
    onMenuItemClick("scenarios");
  };

  const handleShowAllMyScenarios = () => {
    setCurrentView("allMyScenarios");
    setSearchQuery("");
    setExpandedItems({});
    onMenuItemClick("my-scenarios");
  };

  const handleBack = () => {
    setCurrentView("menu");
    setSearchQuery("");
  };

  const handleSearchFocus = (e) => {
    e.target.select();
  };

  const renderListItem = (item, isLast, isSelected, onClick) => {
    let ListIconComponent;
    if (isLast) {
      ListIconComponent = isSelected ? ListItemLastCurrIcon : ListItemLastIcon;
    } else {
      ListIconComponent = isSelected ? ListItemCurrIcon : ListItemIcon;
    }
    const itemName = item.title || item.name || "Без названия";
    return (
      <div
        key={`${item.type || "item"}-${item.dashboard_id || item.id || "unknown"}`}
        className={`${styles.submenuItem} ${isSelected ? styles.selected : ""}`}
        onClick={() => onClick(item)}
      >
        <ListIconComponent className={styles.listIcon} />
        <p>{itemName}</p>
      </div>
    );
  };

  const handleDashboardSelect = (dashboard) => onDashboardSelect(dashboard);
  const handleTemplateSelect = (template) => onTemplateSelect(template);
  const handleScenarioSelect = (scenario) => onScenarioSelect(scenario);
  const handleMyScenarioSelect = (scenario) => onMyScenarioSelect(scenario);

  const renderMenuItem = (item) => {
    const IconComponent = item.icon;
    const isExpanded = expandedItems[item.id];
    const isActive = activeItem === item.id;

    return (
      <React.Fragment key={item.id}>
        <div
          className={`${styles.menuItem} ${isActive ? styles.current : ""} ${item.disabled ? styles.menuItemDisabled : ""}`}
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
            selectedScenario={selectedScenario}
            selectedMyScenario={selectedMyScenario}
            onTemplateSelect={handleTemplateSelect}
            onDashboardSelect={handleDashboardSelect}
            onScenarioSelect={handleScenarioSelect}
            onMyScenarioSelect={handleMyScenarioSelect}
            onShowAllTemplates={handleShowAllTemplates}
            onShowAllDashboards={handleShowAllDashboards}
            onShowAllScenarios={handleShowAllScenarios}
            onShowAllMyScenarios={handleShowAllMyScenarios}
            onCreateDashboard={onCreateDashboard}
            onCreateScenario={onCreateScenario}
            renderListItem={renderListItem}
          />
        )}
      </React.Fragment>
    );
  };

  // Страницы "Показать все"
  if (
    [
      "allTemplates",
      "allDashboards",
      "allScenarios",
      "allMyScenarios",
    ].includes(currentView)
  ) {
    const isTemplates = currentView === "allTemplates";
    const isDashboards = currentView === "allDashboards";
    const isScenarios = currentView === "allScenarios";
    const isMyScenarios = currentView === "allMyScenarios";

    let title = "",
      subtitle = "",
      handleSelect,
      selectedItem,
      itemsList,
      placeholder = "";
    if (isTemplates) {
      title = "Готовые шаблоны";
      subtitle = "Готовые шаблоны дашбордов для ваших целей.";
      handleSelect = handleTemplateSelect;
      selectedItem = selectedTemplate;
      itemsList = filteredItems;
      placeholder = "Поиск шаблонов";
    } else if (isDashboards) {
      title = "Мои дашборды";
      subtitle = "Ваши созданные дашборды и аналитические панели.";
      handleSelect = handleDashboardSelect;
      selectedItem = selectedDashboard;
      itemsList = filteredItems;
      placeholder = "Поиск дашбордов";
    } else if (isScenarios) {
      title = "Готовые сценарии";
      subtitle = "Предустановленные сценарии анализа данных.";
      handleSelect = handleScenarioSelect;
      selectedItem = selectedScenario;
      itemsList = filteredItems;
      placeholder = "Поиск сценариев";
    } else {
      title = "Мои сценарии";
      subtitle = "Ваши созданные сценарии.";
      handleSelect = handleMyScenarioSelect;
      selectedItem = selectedMyScenario;
      itemsList = filteredItems;
      placeholder = "Поиск сценариев";
    }

    return (
      <div className={styles.leftMenu}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <img src={Logo} alt="logo" />
            <div className={styles.logoText}>
              <h2>Speech Up+</h2>
            </div>
          </div>
        </div>
        <div className={styles.main}>
          <div className={styles.readyTemplates}>
            <h2>{title}</h2>
            <h3>{subtitle}</h3>
          </div>
          <SearchBox
            placeholder={placeholder}
            value={searchQuery}
            onChange={setSearchQuery}
            onFocus={handleSearchFocus}
          />
          <SimpleBar
            className={styles.simplebarContainer}
            style={{
              width: "15.2083vw",
              // height: "38.2813vw",
            }}
            forceVisible="y"
          >
            <div className={styles.mainMenu}>
              <div className={styles.allTemplatesSection}>
                {!isLoadingDashboards &&
                !isLoadingMyScenarios &&
                itemsList.length > 0 ? (
                  <div className={styles.allTemplatesList}>
                    {itemsList.map((item, index) =>
                      renderListItem(
                        item,
                        index === itemsList.length - 1,
                        isTemplates
                          ? selectedItem?.id === item.id
                          : isDashboards
                            ? selectedItem?.dashboard_id === item.dashboard_id
                            : selectedItem?.id === item.id,
                        handleSelect,
                      ),
                    )}
                  </div>
                ) : (
                  <div className={styles.noResults}>
                    <p>Элементы не найдены</p>
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
            <h2>Speech Up+</h2>
          </div>
        </div>
      </div>
      <div className={styles.main}>
        <div className={styles.account}>
          <div className={styles.accountInfo}>
            <img src={Photo} alt="photo" />
            <div className={styles.name}>
              <h2>Головачева Полина</h2>
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
