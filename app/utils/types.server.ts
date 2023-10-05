import { z } from "zod";

export const LoginForm = z.object({
  email: z.string({
    required_error: "Email is mandatory",
    invalid_type_error: "Check email format",
  }).email({ message: "Invalid email address" }),
  password: z.string({
    required_error: "Password is mandatory",
    invalid_type_error: "Check value for your password",
  }).min(5, { message: "Must be 5 or more characters long" }),
});

export const SignUpForm = z.object({
  /*firstName: z.nullable(z.string()).optional(),
  lastName: z.nullable(z.string()).optional(), */
  firstName: z.string({
    required_error: "First Name is mandatory",}).min(4, { message: "Must be 4 or more characters long" }),
  lastName: z.string().min(4, { message: "Must be 4 or more characters long" }),
}).merge(LoginForm);

// export type LoginForm = {
//  email: string;
//  password: string;
//  firstName: string | null;
//  lastName: string | null;
// }
// export type LoginFormType = z.infer<typeof SignUpForm>;


export type TLogin = z.infer<typeof LoginForm>;
export type TSignUp = z.infer<typeof SignUpForm>;

export type Action = "login" | "signup";
