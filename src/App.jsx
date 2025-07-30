import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Teleport from "./pages/Teleport";

const App = () => {
    return (
        <div>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/teleport" element={<Teleport />} />
            </Routes>
        </div>
    );
};

export default App;
