import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "next-themes";
import { Router } from "wouter";

createRoot(document.getElementById("root")!).render(
    <Router base={import.meta.env.BASE_URL}>
        <ThemeProvider attribute="class" defaultTheme="light">
            <App />
        </ThemeProvider>
    </Router>
);
