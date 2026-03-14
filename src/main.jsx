import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import F1RaceEngineer from "./F1RaceEngineer";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <F1RaceEngineer />
  </StrictMode>
);
