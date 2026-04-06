import { useState } from "react";
import { generateTabId } from "@utils/generateId";

const initialTabs = [
  {
    id: generateTabId(),
    name: "Окно 1",
    widgets: [],
    nextWidgetId: 1,
  },
];

export const useDashboardState = () => {
  const [tabs, setTabs] = useState(initialTabs);
  const [activeTab, setActiveTab] = useState(initialTabs[0].id);
  const [nextTabNumber, setNextTabNumber] = useState(2);

  return {
    tabs,
    setTabs,
    activeTab,
    setActiveTab,
    nextTabNumber,
    setNextTabNumber,
  };
};
