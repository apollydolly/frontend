import { useCallback } from "react";
import { generateTabId } from "@utils/generateId";

export const useTabOperations = (
  tabs,
  activeTab,
  nextTabNumber,
  setTabs,
  setActiveTab,
  setNextTabNumber
) => {
  const handleAddTab = useCallback(() => {
    const newTab = {
      id: generateTabId(),
      name: `Окно ${nextTabNumber}`,
      widgets: [],
      nextWidgetId: 1,
    };

    setTabs((prev) => [...prev, newTab]);
    setActiveTab(newTab.id);
    setNextTabNumber((prev) => prev + 1);
  }, [nextTabNumber, setTabs, setActiveTab, setNextTabNumber]);

  const handleTabChange = useCallback(
    (tabId) => {
      setActiveTab(tabId);
    },
    [setActiveTab]
  );

  const handleTabRename = useCallback(
    (tabId, newName) => {
      setTabs((prev) =>
        prev.map((tab) => (tab.id === tabId ? { ...tab, name: newName } : tab))
      );
    },
    [setTabs]
  );

  const handleTabRemove = useCallback(
    (tabId) => {
      if (tabs.length <= 1) return;

      setTabs((prev) => {
        const newTabs = prev.filter((tab) => tab.id !== tabId);
        if (tabId === activeTab) {
          setActiveTab(newTabs[0].id);
        }
        return newTabs;
      });
    },
    [tabs.length, activeTab, setTabs, setActiveTab]
  );

  return {
    handleAddTab,
    handleTabChange,
    handleTabRename,
    handleTabRemove,
  };
};
