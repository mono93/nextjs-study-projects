"use server";

import { createAuthSession, destroySession } from "@/lib/auth";
import { hashUserPassword, verifyPassword } from "@/lib/hash";
import { createUser, getUserByEmail } from "@/lib/user";
import { validateEmail, validatePassword } from "@/utils/sharedFunctions";
import { redirect } from "next/navigation";

export const signup = async (prevState, formData) => {
  const email = formData.get("email");
  const password = formData.get("password");

  let errors = {};

  if (!validateEmail(email)) {
    errors.email = "Invalid email address";
  } else {
    delete errors.email;
  }

  if (!validatePassword(password)) {
    errors.password = "Invalid password";
  } else {
    delete errors.password;
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const hashedPassword = hashUserPassword(password);
  try {
    createUser(email, hashedPassword);
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return {
        errors: {
          email:
            "It seems like an account for the chosen email already exists.",
        },
      };
    }
    throw error;
  }

  redirect("/training");
};

export const login = async (prevState, formData) => {
  const email = formData.get("email");
  const password = formData.get("password");

  const existingUser = getUserByEmail(email);

  if (!existingUser) {
    return {
      errors: {
        email: "Could not authenticate user, please check your credentials.",
      },
    };
  }

  const isValidPassword = verifyPassword(existingUser.password, password);

  if (!isValidPassword) {
    return {
      errors: {
        password: "Could not authenticate user, please check your credentials.",
      },
    };
  }

  await createAuthSession(existingUser.id);
  redirect("/training");
};

export const auth = async (mode, prevState, formData) => {
  if (mode === "login") {
    return login(prevState, formData);
  }
  return signup(prevState, formData);
};

export const logout = async () => {
  await destroySession();
  redirect("/");
};
