import { z } from "zod";
import type { Profile, User, Kudo } from "@prisma/client";

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

export const KudoInputForm = z.object({
  message: z.string().min(10, { message: "You have to enter something nice and not too short" }),
  recipientId: z.string().min(5, { message: "The recipientId is not a valid data" }),
});


export type TLogin = z.infer<typeof LoginForm>;
export type TSignUp = z.infer<typeof SignUpForm>;
export type TKudoInput = z.infer<typeof KudoInputForm>;

export type Action = "login" | "signup";

export type UserCircleProps = {
  profile: Profile;
  className?: string;
  onClick?: (...args: any) => void;
}

export type UserPanelProps = {
  users: User[];
}

export type PortalProps = {
  children: React.ReactNode;
  wrapperId: string;
}

export type ModalProps = {
  children: React.ReactNode;
  isOpen: boolean;
  ariaLabel?: string;
  className?: string;
}

export type SelectBoxProps = {
  options: {
    name: string;
    value: any;
  }[];
  className?: string;
  containerClassName?: string;
  id?: string;
  name?: string;
  label?: string;
  value?: any;
  onChange?: (...args: any) => void;
}

export type KudoProps = {
  profile: Profile;
  kudo: Partial<Kudo>;
}

export type KudoWithProfile = {
  kudo: Kudo;
  author: {
    profile: Profile,
  }
}

export type KudoWithRecipient = {
  kudo: Kudo;
  recipient: User;
}
