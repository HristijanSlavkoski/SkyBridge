import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "next-themes";
import { Router } from "wouter";

const base = import.meta.env.BASE_URL.replace(/\/$/, "");

createRoot(document.getElementById("root")!).render(
    <Router base={base}>
        <ThemeProvider attribute="class" defaultTheme="light">
            <App />
        </ThemeProvider>
    </Router>
);
