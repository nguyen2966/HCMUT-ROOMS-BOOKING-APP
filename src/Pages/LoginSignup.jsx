import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import hcmut_img from "../Assets/login_hcmut.png";
import "./CSS/LoginSignup.css";

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  // ---------- LOGIN ----------
  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      login(data.user);

      if (data.user.role === "Admin") {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="loginsignup">
      <div className="loginsignup-fields">
        {isLogin ? (
          <>
            <h1>Welcome Back!</h1>
            <p>Submit your credentials to access your account</p>

            <div className="loginsignup-inputs">
              <label htmlFor="email-address">Email address</label>
              <input
                name="email-address"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="loginsignup-inputs">
              <label htmlFor="password">Password</label>
              <input
                name="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <button onClick={handleLogin}>Login</button>
            <p>
              Don’t have an account yet?{" "}
              <span onClick={() => setIsLogin(false)}>Sign up</span>
            </p>
          </>
        ) : (
          // ... your signup JSX remains unchanged
          <div className="signup-form">
            <h1>Get Started Now</h1>
            {/* signup fields here */}
            <div className="signup-input-row">
               <div className="signup-field">
                 <label htmlFor="email">Email address</label>
                 <input name="email" type="email" placeholder="Enter your email" />
               </div>
               <div className="signup-field">
                 <label htmlFor="fullname">Full Name</label>
                 <input name="fullname" type="text" placeholder="Enter your name" />
               </div>
             </div>

             <div className="signup-input-row">
               <div className="signup-field">
               <label htmlFor="password">Password</label>
                <input name="password" type="password" placeholder="Password" />
               </div>
               <div className="signup-field">
                 <label htmlFor="confirm">Confirm Password</label>
                 <input name="confirm" type="password" placeholder="Confirm Password" />
               </div>
            </div>

             <button className="signup-btn">Register</button>

             <p>
               Already have an account?{" "}
               <span onClick={() => {setIsLogin(true)}}>Log in</span>
             </p>
           </div>
        )}
      </div>

      <div className="loginsignup-hcmut-image">
        <img src={hcmut_img} alt="HCMUT" />
      </div>
    </div>
  );
};

export default LoginSignup;
