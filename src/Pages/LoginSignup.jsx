import React, { useState } from "react";
import hcmut_img from "../Assets/login_hcmut.png";
import "./CSS/LoginSignup.css";

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true); // true = show login form

  return (
    <div className="loginsignup">
      {/* ===== Left side (form) ===== */}
      <div className="loginsignup-fields">
        {isLogin ? (
          <>
            <h1>Welcome Back!</h1>
            <p>Submit your credentials to access your account</p>

            <div className="loginsignup-inputs">
               <label htmlFor="email-address">Email address</label>
               <input name="email-address" type="email" placeholder="Enter your email" />  
            </div>
            
            <div className="loginsignup-inputs">
              <label htmlFor="password">Password</label>
              <input name="password" type="password" placeholder="Enter your password" />
            </div>
            

            <div className="loginsignup-remember-me">
              <input type="checkbox" name="remember-me" />
              <label htmlFor="remember-me">Remember for 30 days</label>
            </div>

            <div className="loginsignup-forgot-password">
              <p>or</p>
              <hr />
              <p>Forgot password</p>
            </div>

            <button>Login</button>
            <p>
              Don’t have an account yet?{" "}
              <span onClick={() => setIsLogin(false)}>Sign up</span>
            </p>
          </>
        ) : (
            <div className="signup-form">
            <h1>Get Started Now</h1>

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
              <span onClick={() => setIsLogin(true)}>Log in</span>
            </p>
          </div>
        )}
      </div>

      {/* ===== Right side (image) ===== */}
      <div className="loginsignup-hcmut-image">
        <img src={hcmut_img} alt="HCMUT" />
      </div>
    </div>
  );
};

export default LoginSignup;
