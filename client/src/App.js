import { Header } from "./component/Header.js";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./style.css";
import { Main } from "./component/Main";
import { ConfigurationForm } from "./component/ConfigurationForm.js";
import { Item } from "./component/Item.js";

function App() {
  return (
    <Router>
      <Header />
      <div id="container">
        <Routes>
          <Route path="/" Component={Main} />
          <Route path="/confs/:name" Component={ConfigurationForm} />
          <Route path="/items/:id" Component={Item} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
