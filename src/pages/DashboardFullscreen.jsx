import React, { useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CreateDashboard } from "@dashboard/CreateDashboard";

export const DashboardFullscreen = () => {
  useEffect(() => {
    document.title = "Дашборд";
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        style={{
          width: "100vw",
          height: "100vh",
        }}
      >
        <CreateDashboard isFullscreen={true} />
      </div>
    </DndProvider>
  );
};
