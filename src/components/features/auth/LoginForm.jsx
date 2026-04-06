import React, { useState } from "react";
import { useAuth } from "@contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { PrimaryButton } from "@ui/buttons/PrimaryButton";
import { InputField } from "@ui/shared/InputField";
import styles from "./AuthForms.module.scss";

export const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const { isAuthenticated, login, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (error) clearError();
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(formData.username, formData.password);

    if (result.success) {
      navigate("/");
    }

    setIsLoading(false);
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authForm}>
        <h2 className={styles.formTitle}>Вход в систему</h2>

        <form onSubmit={handleSubmit}>
          <InputField
            label="Логин"
            type="text"
            name="username"
            value={formData.username}
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

          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.buttonsContainer}>
            <PrimaryButton
              type="submit"
              text={isLoading ? "Вход..." : "Войти"}
              disabled={isLoading}
            />
          </div>
        </form>

        <div className={styles.authLinks}>
          <p>
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
