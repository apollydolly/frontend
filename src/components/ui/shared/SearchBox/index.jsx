import React from "react";
import styles from "./SearchBox.module.scss";
import SeacrhIcon from "@icons/search.svg";
import FilterIcon from "@icons/filter.svg";

export const SearchBox = ({
  placeholder = "Поиск...",
  value,
  onChange,
  onFocus,
  onFilterClick,
  noFilter = false,
  wide = false,
}) => {
  const handleSearchChange = (e) => {
    onChange(e.target.value);
  };

  const handleSearchFocus = (e) => {
    if (onFocus) {
      onFocus(e);
    } else {
      e.target.select();
    }
  };

  return (
    <div className={`${styles.searchBox} ${wide ? styles.wide : undefined}`}>
      <div className={styles.search}>
        <img src={SeacrhIcon} alt="search" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          className={styles.searchInput}
        />
      </div>
      {!noFilter && (
        <div className={styles.filter} onClick={onFilterClick}>
          <img src={FilterIcon} alt="filter" />
        </div>
      )}
    </div>
  );
};
