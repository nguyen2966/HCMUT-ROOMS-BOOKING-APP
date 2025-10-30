import Sidebar from "../Components/Sidebar/Sidebar"
import {useState} from 'react'
import { userMenu } from "./MenuData";
import "./CSS/Home.css"




const Home = () =>{
  const [selected, setSelected] = useState(0);
  const SelectedComponent = userMenu[selected].component;

  return (
    <div className="Home">
          <Sidebar menu={userMenu} selected={selected} onSelect={setSelected} />
          <div className="Home-content">
            <SelectedComponent />
          </div>
        </div>
  )
}

export default Home