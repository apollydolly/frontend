export const generateId = () =>
  `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
export const generateTabId = () =>
  `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
