import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/App.css'
import App from './App.jsx'
import LoginPage from './Forms/LoginPage.jsx'
import SignUp from "./Forms/SignUp.jsx";

import { BrowserRouter, Routes, Route } from "react-router";

createRoot(document.getElementById("root")).render(
  <>
    {/* <StrictMode> */}
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />}></Route>
        <Route path="/App" element={<App />}></Route>
        <Route path="/SignUp" element={<SignUp />}></Route>
      </Routes>
      </BrowserRouter>
    {/* </StrictMode> */}
    ,
  </>
);
