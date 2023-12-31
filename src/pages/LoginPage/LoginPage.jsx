import { useState, useRef } from "react";
import styles from "./LoginPage.module.css";
import Input from "../../components/ui/Input/Input";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/userServices";
import {
  validateEmail,
  validatePassword,
} from "../../components/validation/validation";

const LoginPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    genericError: "",
  });

  const formRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const checkAuthentication = async (email, password) => {
    try {
      const response = await loginUser(email, password);
      if (response.data && response.data.accessToken) {
        localStorage.setItem("accessToken", response.data.accessToken);
        return true;
      }
    } catch (error) {
      console.error(
        "Error during login:",
        error.response ? error.response.data.message : error.message
      );
      return false;
    }
  };

  const validateForm = async () => {
    let isValid = true;
    let tempErrors = {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
    };

    if (tempErrors.email || tempErrors.password) {
      isValid = false;
    }

    if (
      isValid &&
      !(await checkAuthentication(formData.email, formData.password))
    ) {
      isValid = false;
      tempErrors.genericError = "Email or password is wrong";
    }

    setErrors(tempErrors);
    return isValid;
  };

  const resetForm = () => {
    if (formRef.current) {
      formRef.current.reset();
      setFormData({
        email: "",
        password: "",
      });
      setErrors({
        email: "",
        password: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await validateForm()) {
      console.log("Form is valid");
      resetForm();
      navigate("/home");
    } else {
      console.log("Form has errors");
    }
  };

  return (
    <div className={styles["login-page"]}>
      <form
        className={styles["form-login"]}
        onSubmit={handleSubmit}
        ref={formRef}>
        <h2 className={styles["heading-login"]}>Login</h2>

        <Input
          className={styles["input-field"]}
          label="Email"
          type="text"
          value={formData.email}
          name="email"
          onChange={handleInputChange}
          placeholder="Enter your email"
        />
        {errors.email && (
          <p className={styles["error-email"]}>{errors.email}</p>
        )}
        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Enter your password"
        />
        {errors.password && (
          <p className={styles["error-password"]}>{errors.password}</p>
        )}
        {errors.genericError && (
          <p className={styles["error-generic-error"]}>{errors.genericError}</p>
        )}
        <button type="submit" className={styles["submit-button"]}>
          Login
        </button>

        <Link className={styles["forgot-button"]} to={`/forgot`}>
          <p>Forgot password</p>
        </Link>
      </form>
    </div>
  );
};
export default LoginPage;
