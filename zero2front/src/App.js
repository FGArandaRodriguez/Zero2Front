import './App.css';
import Cosina from './componentes/cartas/kitchen-order.tsx';
import Empleado from './componentes/empleados/employee-crud.tsx';
function App() {
  return (
    <div className="App">
      <div>
          <div className="app-background">
          <Cosina></Cosina>
          <Empleado></Empleado>
          </div>
        </div>
      </div>
    
  );
}

export default App;
