import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DrawerMenu from "./layouts/DrawerMenu";
import Home from "./pages/home/Home";
import Items from "./pages/items/Items";
import AddOrder from "./pages/orders/AddOrder"; // Importando o componente AddOrder
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Definindo o tema
const theme = createTheme({
  typography: {
    fontFamily: "'Roboto', sans-serif",
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <DrawerMenu> {/* O DrawerMenu agora envolve o conteúdo das rotas */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/items" element={<Items />} />            
            <Route path="/orders/addorder" element={<AddOrder />} /> {/* Nova rota */}            
          </Routes>
        </DrawerMenu>
      </Router>
    </ThemeProvider>
  );
};

export default App;