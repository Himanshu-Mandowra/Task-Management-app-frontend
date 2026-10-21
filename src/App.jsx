import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import ServerGate from "./components/ServerGate";

function App() {
  return (
    <ServerGate>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ServerGate>
  );
}

export default App;
