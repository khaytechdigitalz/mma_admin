"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FloatingInput } from "@/components/ui/floating-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FacebookIcon, GoogleIcon } from "../../icons";
import { Logo } from "@/components/ui/logo";

export function SignupForm() {
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);

  return (
    <div>
      {/* Logos & Illustration */}
      <div className="flex flex-col items-start mb-8">
        <Link href="/" className="mb-8">
          <Logo/>
        </Link>
         
        <h1 className="text-2xl font-public-sans font-bold text-light-primary-text mb-2">
          Sign Up
        </h1>
        <p className="text-gray-600 font-public-sans text-sm">
          First Create our platform? Sign up in with seconds.
        </p>
      </div>

      {/* Social Login */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          type="button"
          className="flex items-center font-bold h-12 text-light-primary-text font-public-sans justify-center gap-2 py-3 px-4 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors"
        >
          <GoogleIcon />
          Google
        </button>
        <button
          type="button"
          className="flex items-center font-bold h-12 text-light-primary-text font-public-sans justify-center gap-2 py-3 px-4 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors"
        >
          <FacebookIcon />
          Facebook
        </button>
      </div>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-500/20"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-light-secondary-text">Or</span>
        </div>
      </div>

      {/* Form */}
      <form className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FloatingInput label="Name" id="name" type="text" className="h-12" />
          <FloatingInput
            label="Email"
            id="email"
            type="email"
            className="h-12"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FloatingInput
            label="Password"
            id="password"
            type="password"
            className="h-12"
          />
          <FloatingInput
            label="Confirm password"
            id="confirm-password"
            type="password"
          />
        </div>

        <div className="flex items-center gap-2 mt-2">
          <Checkbox
            id="terms"
            checked={acceptedTerms}
            onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
          />
          <label
            htmlFor="terms"
            className="text-sm font-public-sans text-light-secondary-text font-medium cursor-pointer"
          >
            I accept Terms and Conditions
          </label>
        </div>

        <Button type="submit" className="w-full h-12 py-3 text-base mt-6">
          Sign Up
        </Button>
      </form>

      <p className="mt-10 text-sm text-light-secondary-text text-center">
        I already have an account?{" "}
        <Link
          href="/signin"
          className="ml-2 font-bold text-primary hover:text-primary-dark"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}
