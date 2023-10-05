import React, { useState, useEffect, useRef } from "react";
import { Layout } from "~/components/layout";
import { FormField } from "~/components/form-field";
import { json, type ActionFunction, type LoaderFunction, redirect } from "@remix-run/node";
import { login, register, getUser } from "~/utils/auth.server";
import { useActionData } from "@remix-run/react";
import { SignUpForm, LoginForm, type TSignUp } from "~/utils/types.server";
import { fromZodError } from 'zod-validation-error';
import { ZodError } from "zod";

type Action = "login" | "signup";

export const loader: LoaderFunction = async ({ request }) => {
  return await getUser(request) ? redirect("/") : null;
}

const generateErrorObj = (err: ZodError): Record<string, string> => {
  const validationError = fromZodError(err);
  let errors: Record<string, string> = {};
  for (let i = 0; i < validationError.details.length; i++) {
    const { path, message } = validationError.details[i];
    errors = {...errors, 
      [path.toString()]: message }
  }
  return errors;
}

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const action = form.get("_action") as Action;
  const email = form.get("email");
  const password = form.get("password");
  const firstName = form.get("firstName");
  const lastName = form.get("lastName");

  // Use ZOD in order to validate structure and data sent from the Form
  switch(action) {
    case "login": {
      try {
        const userLogin = LoginForm.parse({ email, password });
        return await login(userLogin);
      } catch (err) {
        if (err instanceof ZodError) {
          const errors = generateErrorObj(err);
          return json({ errors, fields: { email, password }, form: action }, { status: 400 });
        }
        return json({ error: "Invalid form data", form: action }, { status: 400 });
      }
    }
    case "signup": {
      try {
        const userSignIn = SignUpForm.parse({ email, password, firstName, lastName });
        return await register(userSignIn);
      } catch (err) {
        if (err instanceof ZodError) {
          const errors = generateErrorObj(err);
          return json({ errors, fields: { email, password, firstName, lastName }, form: action }, { status: 400 });
        }
        return json({ error: "Invalid form data", form: action }, { status: 400 });
      }
    }
    default: 
      return json({ error: "Invalid form data", form: action }, { status: 400 });
  }
}

export default function Login() {
  const actionData = useActionData();
  const firstLoad = useRef(true);
  const [formData, setFormData] = useState<TSignUp>({
    email: actionData?.fields?.email || '',
    password: actionData?.fields?.password || "",
    firstName: actionData?.fields?.firstName || "",
    lastName: actionData?.fields?.lastName || "",
  });
  const [action, setAction] = useState<Action>("login");
  const [validationError, setValidationError] = useState(actionData?.errors || {});
  const [formError, setFormError] = useState(actionData?.error || '')

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, field: string): void => {
    setFormData({...formData, [field]: event.currentTarget.value});
  }

  useEffect(() => {
    if (!firstLoad.current) {
      const clearState = {
        email: '',
        password: '',
        firstName: '',
        lastName: '',
      };
      setFormData(clearState);
      setValidationError(clearState);
      setFormError('')
    }
  }, [action]);

  useEffect(() => {
    if (!firstLoad.current) {
      setFormError('')
    }
  }, [formData]);

  useEffect(() => { firstLoad.current = false }, []);

  return (
    <Layout>
      <div className="h-full flex justify-center items-center flex-col gap-y-4">
        <button
          className="absolute top-8 right-8 rounded-xl bg-yellow-300 font-semibold text-blue-600 px-3 py-2 transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
          onClick={() => setAction(action === "login" ? "signup" : "login")}
        >
          {action === "login" ? "Sign Up" : "Sign In"}
        </button>
        <h2 className="text-5xl font-extrabold text-yellow-300">Welcome to Kudos</h2>
        <p className="font-semibold text-slate-300">
          { action === "login" ? "Log in to give you some praise!" : "Sign up to get started!" }
          </p>
        <form
          method="post"
          className="rounded-2xl bg-gray-200 p-6 w-96">
          <div className="text-xs font-semibold text-center tracking-wide text-red-500 w-full">{formError}</div>
          <FormField
            htmlFor="email"
            label="Email"
            value={formData.email}
            onChange={(e) => handleInputChange(e, "email")}
            error={validationError?.email}
          />
          <FormField
            htmlFor="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange(e, "password")}
            error={validationError?.password}
          />
          { action === "signup" ?
            <>
                <FormField
                  htmlFor="firstName"
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange(e, "firstName")}
                  error={validationError?.firstName}
                />
                <FormField
                  htmlFor="lastName"
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange(e, "lastName")}
                  error={validationError?.lastName}
                />
              </> : null }
          <div className="w-full text-center">
            <button
              type="submit"
              name="_action"
              value={action}
              className="rounded-xl mt-2 bg-yellow-300 px-3 py-2 text-blue-600 font-semibold transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
            >
              { action === "login" ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
