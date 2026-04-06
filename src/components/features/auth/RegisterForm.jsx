import React, { useState } from "react";
import { useAuth } from "@contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { PrimaryButton } from "@ui/buttons/PrimaryButton";
import { InputField } from "@ui/shared/InputField";
import styles from "./AuthForms.module.scss";

export const RegisterForm = () => {
  const [formData, setFormData] = useState({
    login: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (error) clearError();
    if (validationError) setValidationError("");

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setValidationError("Пароли не совпадают");
      return false;
    }
    if (formData.password.length < 6) {
      setValidationError("Пароль должен быть не менее 6 символов");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    const result = await register(
      formData.login,
      formData.email,
      formData.password
    );

    if (result.success) {
      navigate("/login");
    }

    setIsLoading(false);
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authForm}>
        <h2 className={styles.formTitle}>Регистрация</h2>

        <form onSubmit={handleSubmit}>
          <InputField
            label="Логин"
            type="text"
            name="login"
            value={formData.login}
            onChange={handleChange}
            required
            disabled={isLoading}
          />

          <InputField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
          />

          <InputField
            label="Пароль"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
          />

          <InputField
            label="Подтвердите пароль"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={isLoading}
          />

          {(error || validationError) && (
            <div className={styles.error}>{error || validationError}</div>
          )}
          <div className={styles.buttonsContainer}>
            <PrimaryButton
              type="submit"
              text={isLoading ? "Регистрация..." : "Зарегистрироваться"}
              disabled={isLoading}
            />
          </div>
        </form>

        <div className={styles.authLinks}>
          <p>
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
