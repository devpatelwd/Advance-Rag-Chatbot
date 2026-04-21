import { BrowserRouter , Route , Routes } from "react-router-dom";
import RagChat from "./components/RagChat";

export default function App(){
  return <BrowserRouter>
      <Routes>
        <Route path="/" element={<RagChat/>}/>
        
      </Routes>
  </BrowserRouter>
}