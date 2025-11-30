import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary";

console.log("🚀 Synapse iniciando...");
console.log("📦 Variáveis de ambiente:", {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ? "✅ Configurado" : "❌ Faltando",
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? "✅ Configurado" : "❌ Faltando",
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID ? "✅ Configurado" : "❌ Faltando",
  VITE_API_URL: import.meta.env.VITE_API_URL || "❌ Usando padrão (localhost:3000)",
  NODE_ENV: import.meta.env.MODE,
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("❌ Elemento root não encontrado no DOM");
}

console.log("✅ Elemento root encontrado, renderizando App...");

createRoot(rootElement).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
