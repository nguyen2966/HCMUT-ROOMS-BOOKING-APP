import './Navbar.css'
import hcmut_logo from "../../Assets/logo_header.png"
import { Link } from 'react-router-dom'
import { useState } from 'react'

const Navbar = () =>{
  const [menu,setMenu] = useState("home");
  return (
   
    <div className='navbar'>
      <div className='navbar-logo'>
        <img src={hcmut_logo} alt="logo"/>
      </div>

      <div className='navbar-options'>
         <Link style={{ textDecoration: "none", color: "inherit" }} to={"/home"}><p onClick={()=>{setMenu("home")}}>Home{menu==="home"?<hr/>:<></>}</p></Link>
         <Link style={{ textDecoration: "none", color: "inherit" }} to={"/rooms"}><p onClick={()=>{setMenu("rooms")}}>Rooms{menu==="rooms"?<hr/>:<></>}</p></Link>
         <Link style={{ textDecoration: "none", color: "inherit" }} to={"/equiqment"}><p onClick={()=>{setMenu("equiqment")}}>Equiqment{menu==="equiqment"?<hr/>:<></>}</p></Link>
         <Link style={{ textDecoration: "none", color: "inherit" }} to={"/"}><button>Log out</button></Link>
          
      </div>
    </div>
  )
}

export default Navbar