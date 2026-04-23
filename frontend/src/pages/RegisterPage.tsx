import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/auth";
import { FormTextField } from "../components/FormTextField";
import type { RegisterFormFields } from "../types/auth";

const REGISTER_FORM_INITIAL: RegisterFormFields = {
  email: "",
  password: "",
  first_name: "",
  last_name: "",
};

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<RegisterFormFields>(REGISTER_FORM_INITIAL);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const key = name as keyof RegisterFormFields;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await register(form);
      navigate("/login");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Create account
        </h1>
        <p className="text-gray-500 mb-6">Start planning your Edinburgh trip</p>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormTextField
              label="First name"
              type="text"
              name="first_name"
              autoComplete="given-name"
              value={form.first_name}
              onChange={handleChange}
              required
            />
            <FormTextField
              label="Last name"
              type="text"
              name="last_name"
              autoComplete="family-name"
              value={form.last_name}
              onChange={handleChange}
              required
            />
          </div>
          <FormTextField
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <FormTextField
            label="Password"
            type="password"
            name="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 text-white py-4 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};
