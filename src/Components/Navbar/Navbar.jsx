import './Navbar.css'
import hcmut_logo from "../../Assets/logo_header.png"
import { Link } from 'react-router-dom'
import { useState } from 'react'
import {useAuth} from '../../Context/AuthContext'

const Navbar = () =>{
  const [menu,setMenu] = useState("home");
  const {logout, user} = useAuth();
  return (
   
    <div className='navbar'>
      <div className='navbar-logo'>
        <img src={hcmut_logo} alt="logo"/>
      </div>

      <ul className='navbar-options'>
         <Link style={{ textDecoration: "none", color: "inherit" }} to={"/home"}><li onClick={()=>{setMenu("home")}}>Home{menu==="home"?<hr/>:<></>}</li></Link>
         <Link style={{ textDecoration: "none", color: "inherit" }} to={"/rooms"}><li onClick={()=>{setMenu("rooms")}}>Rooms{menu==="rooms"?<hr/>:<></>}</li></Link>
         <Link style={{ textDecoration: "none", color: "inherit" }} to={"/equiqment"}><li onClick={()=>{setMenu("equiqment")}}>Equiqment{menu==="equiqment"?<hr/>:<></>}</li></Link>
         {user?.role === "Admin" && (
           <Link style={{ textDecoration: "none", color: "inherit" }} to={"/admin"}><li onClick={()=>{setMenu("admin")}}>Admin{menu==="admin"?<hr/>:<></>}</li></Link>
         )}
         {user?.role === "Technical Team" && (
           <Link style={{ textDecoration: "none", color: "inherit" }} to={"/technicalteam"}><li onClick={()=>{setMenu("technicalteam")}}>Technical Team{menu==="technicalteam"?<hr/>:<></>}</li></Link>
         )}
         <Link style={{ textDecoration: "none", color: "inherit" }} to={"/"}><button onClick={()=>logout()}>Log out</button></Link>
          
      </ul>
    </div>
  )
}

export default Navbar