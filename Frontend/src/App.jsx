import {Route, Routes} from "react-router-dom"

// PAGES IMPORT 
import LoginPage from "./pages/LoginPage.jsx"

// COMPONENTS IMPORT
import Header from "./components/Header.jsx"

function App() {

  return (
    <div>
      
      {/* // Auth Routes */}
      <Routes>
        <Route path={"/"} element={<LoginPage />} />
      </Routes>

      {/* <Header /> */}
    </div>
  )
}

export default App
