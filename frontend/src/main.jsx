import React from "react";
import { createRoot } from "react-dom/client";
import AppWrapper from "./AppWrapper.jsx";
import "./tailwind.css";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);
