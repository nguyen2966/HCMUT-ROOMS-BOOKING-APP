import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import hcmut_img from "../Assets/login_hcmut.png";
import "./CSS/LoginSignup.css";
import API_BASE_URL from "../config/api";

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [roleId, setRoleId] = useState("1"); // default: Student
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  // ---------- LOGIN ----------
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const success = await login(email, password); // calls login() from AuthContext

      if (success) {
        navigate("/home");
      } else {
        setError("Invalid email or password.");
      }
    } catch (err) {
      console.error(err);
      setError("Login failed. Please try again.");
    }
  };

  // ---------- SIGNUP ----------
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          full_name: fullname,
          phone_num: phone,
          role_id: roleId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed");
        return;
      }

      alert("Registration successful! You can now log in.");
      setIsLogin(true);
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="loginsignup">
      <div className="loginsignup-fields">
        {isLogin ? (
          <>
            <h1>Welcome Back!</h1>
            <p>Submit your credentials to access your account</p>

            <form onSubmit={handleLogin}>
              <div className="loginsignup-inputs">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="loginsignup-inputs">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p style={{ color: "red" }}>{error}</p>}

              <button type="submit">Login</button>
            </form>

            <p>
              Don’t have an account yet?{" "}
              <span onClick={() => setIsLogin(false)}>Sign up</span>
            </p>
          </>
        ) : (
          <div className="signup-form">
            <h1>Get Started Now</h1>
            <form onSubmit={handleSignup}>
              <div className="signup-input-row">
                <div className="signup-field">
                  <label htmlFor="email">Email address</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="signup-field">
                  <label htmlFor="fullname">Full Name</label>
                  <input
                    id="fullname"
                    type="text"
                    placeholder="Enter your name"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="signup-input-row">
                <div className="signup-field">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    type="text"
                    placeholder="0909123456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="signup-field">
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                  >
                    <option value="1">Student</option>
                    <option value="2">Lecturer</option>
                  </select>
                </div>
              </div>

              <div className="signup-input-row">
                <div className="signup-field">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="signup-field">
                  <label htmlFor="confirm">Confirm Password</label>
                  <input
                    id="confirm"
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && <p style={{ color: "red" }}>{error}</p>}

              <button type="submit" className="signup-btn">
                Register
              </button>
            </form>

            <p>
              Already have an account?{" "}
              <span onClick={() => setIsLogin(true)}>Log in</span>
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
