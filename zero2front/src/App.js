import './App.css';
import Cocinaorden from './componentes/cartas/kitchen-order';
import Empleados from './componentes/empleados/employee-crud';
//import employee
function App() {
  return (
    <div className="App">
      <div>
          <div className="app-background">
          <Cocinaorden></Cocinaorden>
          <Empleados></Empleados>
          </div>
        </div>
      </div>
    
  );
}

export default App;
