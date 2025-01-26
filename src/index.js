import React from "react";
import ReactDOM from "react-dom/client";  // Importação do cliente no React 18
import App from "./App"; // Importa o App.js

// Criando o root e renderizando a aplicação
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);