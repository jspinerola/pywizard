import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import Code from "./pages/Code.tsx";
import Layout from "./components/Layout.tsx";
import Home from "./pages/Home.tsx";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="code" element={<Code />} />
      </Route>
    </Routes>
  </BrowserRouter>
  // </StrictMode>
);
