// import { Form, redirect, useActionData, useNavigation } from "react-router";
// import type { ActionFunctionArgs } from "react-router";
// import { useEffect } from "react";
// import { authClient } from "~/lib/auth-client";

// export async function action({ request }: ActionFunctionArgs) {
//   const formData = await request.formData();
//   const email = formData.get("email")?.toString() || "";
//   const name = formData.get("name")?.toString() || "";
//   const password = formData.get("password")?.toString() || "";
//   const confirmPassword = formData.get("confirmPassword")?.toString() || "";

//   if (!email || !name || !password || !confirmPassword) {
//     return { error: "All fields are required" };
//   }

//   if (password !== confirmPassword) {
//     return { error: "Passwords do not match" };
//   }

//   if (password.length < 6) {
//     return { error: "Password must be at least 6 characters" };
//   }

//   try {
//     console.log("📤 Registering user:", { email, name });

//     // const res = await fetch("http://localhost:3000/api/auth/sign-up/email", {
//     //   method: "POST",
//     //   headers: { "Content-Type": "application/json" },
//     //   credentials: "include",   // 🔥 обязательно!
//     //   body: JSON.stringify({ email, name, password }),
//     // });

//     const res = await authClient.signUp.email(
//       {
//       email,
//       name,
//       password
//       }
//     )
//     if (res.error) return {error: res.error.message}
//     return redirect("/kahban")
//   } catch (err: any) {
//     return { error: "Failed to connect to server" };
//   }
// }


import { useState } from "react";
import {useNavigate } from "react-router"
import { authClient } from "~/lib/auth-client";

export default function Register() {
  const [email,setEmail]= useState("");
  const [password,setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword]=useState("")
  const [error,setError]= useState("");
  const [isSubmitting, setIsSubmitting]=useState(false);
  const navigate = useNavigate();

  const handleSubmit= async(e:React.FormEvent) => {
    e.preventDefault();
    setError("");


    if(password!==confirmPassword) {
      setError("Password is not matching");
      return;
    }
    setIsSubmitting(true);

  
    try {
      const res = await authClient.signUp.email({
        email,
        name,
        password,
      })

      if (error){
        return{error:res.error?.message}
      }
      await new Promise(resolve=>setTimeout(resolve,10));
      navigate("/kahban")
    } catch(err:any) {
      setError("Failed to connect to server");
    } finally{
      setIsSubmitting(false);
    }
  }

  const passwordsMatch = password === confirmPassword; 
  const showMatchIndicator = confirmPassword.length > 0;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              value={name}
              type="text"
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              value={password}
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={6}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              value={confirmPassword}
              type="password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                showMatchIndicator
                  ? passwordsMatch
                    ? "border-green-500 focus:ring-green-500"
                    : "border-red-500 focus:ring-red-500"
                  : "focus:ring-blue-500"
              }`}
              required
              minLength={6}
            />
            {showMatchIndicator && (
              <p className={`text-sm mt-1 ${passwordsMatch ? "text-green-600" : "text-red-600"}`}>
                {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !passwordsMatch}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50 transition-colors font-medium"
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </div>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/" className="text-blue-500 hover:underline font-medium">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}