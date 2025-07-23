import React from "react";
import { AudienceTableSection } from "./sections/AudienceTableSection";
import { DashboardSection } from "./sections/DashboardSection";
import { StatsSection } from "./sections/StatsSection";

export const ContainerScreen = (): JSX.Element => {
  return (
    <div className="bg-white flex flex-col w-full min-h-screen">
      <main className="container mx-auto py-4 flex flex-col gap-4">
        <DashboardSection />
        <StatsSection />
        <AudienceTableSection />
      </main>
    </div>
  );
};
