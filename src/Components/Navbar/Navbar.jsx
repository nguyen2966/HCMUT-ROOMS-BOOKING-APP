import './Navbar.css'
import hcmut_logo from "../../Assets/logo_header.png"
import { Link } from 'react-router-dom'
import { useState } from 'react'
import {useAuth} from '../../Context/AuthContext'

const Navbar = () =>{
  const [menu,setMenu] = useState("home");
  const {logout} = useAuth();
  return (
   
    <div className='navbar'>
      <div className='navbar-logo'>
        <img src={hcmut_logo} alt="logo"/>
      </div>

      <ul className='navbar-options'>
         <Link style={{ textDecoration: "none", color: "inherit" }} to={"/home"}><li onClick={()=>{setMenu("home")}}>Home{menu==="home"?<hr/>:<></>}</li></Link>
         <Link style={{ textDecoration: "none", color: "inherit" }} to={"/rooms"}><li onClick={()=>{setMenu("rooms")}}>Rooms{menu==="rooms"?<hr/>:<></>}</li></Link>
         <Link style={{ textDecoration: "none", color: "inherit" }} to={"/equiqment"}><li onClick={()=>{setMenu("equiqment")}}>Equiqment{menu==="equiqment"?<hr/>:<></>}</li></Link>
         <Link style={{ textDecoration: "none", color: "inherit" }} to={"/"}><button onClick={()=>logout()}>Log out</button></Link>
          
      </ul>
    </div>
  )
}

export default Navbar