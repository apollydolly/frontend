import React, { useState, useMemo } from "react";
import SimpleBar from "simplebar-react";
import { useNavigate } from "react-router-dom";
import "simplebar-react/dist/simplebar.min.css";
import styles from "./WidgetPanel.module.scss";
import Logo from "@icons/logo.svg";
import BackIcon from "@icons/back_arrow.svg?react";
import { WidgetItem } from "./WidgetItem";
import { SearchBox } from "@ui/shared/SearchBox";
import { ButtonGray } from "@ui/buttons/ButtonGray";
import { WIDGET_CONFIG } from "@utils/widgets-config";

const WIDGET_TYPES = Object.entries(WIDGET_CONFIG).map(([type, config]) => ({
  type,
  name: config.name,
  icon: config.icon,
}));

export const WidgetPanel = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleBack = () => {
    navigate("/");
  };

  const handleSearchFocus = (e) => {
    e.target.select();
  };

  // Фильтрация виджетов по поисковому запросу
  const filteredWidgets = useMemo(() => {
    if (!searchQuery.trim()) {
      return WIDGET_TYPES;
    }

    const query = searchQuery.toLowerCase();
    return WIDGET_TYPES.filter((widget) =>
      widget.name.toLowerCase().includes(query),
    );
  }, [searchQuery]);

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
        <div className={styles.creatingDashboard}>
          <h2>Создание дашборда</h2>
          <h3>
            Перетащите нужные виджеты {"\n"} на поле дашборда. Данные на {"\n"}
            виджетах демонстрационные.
          </h3>
        </div>
        <SearchBox
          placeholder="Поиск виджетов"
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
          autoHide={false}
          forceVisible="y"
        >
          <div className={styles.mainMenu}>
            <div className={styles.widgetList}>
              {filteredWidgets.length > 0 ? (
                filteredWidgets.map((widget) => (
                  <WidgetItem
                    key={widget.type}
                    type={widget.type}
                    name={widget.name}
                    icon={widget.icon}
                  />
                ))
              ) : (
                <div className={styles.noResults}>
                  <p>Виджеты не найдены</p>
                </div>
              )}
            </div>
          </div>
        </SimpleBar>
        {/* <div className={styles.backButton}> */}
        <ButtonGray text="Выйти" onClick={handleBack} />
        {/* </div> */}
      </div>
    </div>
  );
};
