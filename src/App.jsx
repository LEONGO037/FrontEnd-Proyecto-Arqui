import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Importamos los componentes de layout
import Header from './components/layout/headerPrincipal';
import Footer from './components/layout/footerPrincipal';
// Importamos nuestra vista/página
import Home from './features/home/homePrincipal';

import './App.css';

function App() {
  return (
    <Router>
      {/* Contenedor principal que abarca toda la pantalla */}
      <div className="app-wrapper">
        
        {/* El Header siempre se renderiza arriba */}
        <Header />

        {/* El 'main' contiene las vistas dinámicas. El min-height asegura que el footer baje si hay poco contenido */}
        <main style={{ minHeight: '80vh', padding: '2rem' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Aquí irán tus futuras rutas: */}
            {/* <Route path="/registro" element={<Registro />} /> */}
            {/* <Route path="/pago" element={<Pago />} /> */}
          </Routes>
        </main>

        {/* El Footer siempre se renderiza abajo */}
        <Footer />

      </div>
    </Router>
  );
}

export default App;