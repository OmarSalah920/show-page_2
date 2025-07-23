import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ContainerScreen } from "./screens/ContainerScreen/ContainerScreen";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <ContainerScreen />
  </StrictMode>,
);
