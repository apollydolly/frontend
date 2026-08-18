import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { WidgetPanel } from "@dashboard/WidgetPanel";
import { CreateDashboard } from "@dashboard/CreateDashboard";
import { useParams } from "react-router-dom";

export const EditDashboardPage = () => {
  const { dashboardId } = useParams();

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        style={{
          display: "flex",
          width: "100vw",
          height: "min(100vh, 56.25vw)",
        }}
      >
        <WidgetPanel />
        <CreateDashboard editMode={true} dashboardId={dashboardId} />
      </div>
    </DndProvider>
  );
};
