import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "next-themes";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
    <BrowserRouter basename={import.meta.env.BASE_URL}>
        <ThemeProvider attribute="class" defaultTheme="light">
            <App />
        </ThemeProvider>
    </BrowserRouter>
);
