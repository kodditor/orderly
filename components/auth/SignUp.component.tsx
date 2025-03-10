"use client";

import { clientSupabase } from "@/app/supabase/supabase-client";
import { faEyeSlash, faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { popupText } from "../Popup.component";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { POPUP_STATE } from "@/models/popup.enum";
import { usePostHog } from "posthog-js/react";

/*
 * TODO
 * Add pattern validation
 * Add indicator
 * Add password scheme rules
 */

type signUpDetails = {
  email: string;
  password: string;
};

export default function SignUpComponent() {
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [verified, setVerified] = useState<boolean>(false);
  const [failedSignUpsCounter, setFailedSignUps] = useState<number>(0);
  const [sentEmail, setSentEmail] = useState<boolean>(false);

  const captchaRef = useRef<HCaptcha>(null);

  const [signUpDetails, setSignUpDetails] = useState<signUpDetails>({
    email: "",
    password: "",
  });

  const supabase = clientSupabase;

  let destination = searchParams.get("to");
  const posthog = usePostHog()
  useEffect(() => {
    posthog.startSessionRecording()
  })

  async function handleSignUpSubmit(e: FormEvent) {
    e.preventDefault();
    if (!verified) return;
    setSubmitted(true);

    let { data, error } = await supabase.auth.signUp({
      ...signUpDetails,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/signup/callback`,
      },
    });

    if (data.user) {
      setSentEmail(true);
      captchaRef.current!.resetCaptcha();
      setSubmitted(false);
    } else {
      popupText("An error occurred when trying to sign in.", POPUP_STATE.FAILED);
      if (failedSignUpsCounter + 1 === 5) {
        captchaRef.current!.resetCaptcha();
        setSubmitted(false);
        setFailedSignUps(0);
        return;
      }
      setFailedSignUps((prev) => prev + 1);
      //console.log(error)
      setSubmitted(false);
    }
  }

  function handleValueChange(e: any) {
    let field = e.target.name;
    let value = e.target.value;

    switch (field) {
      case "email":
      case "password":
        setSignUpDetails((prev) => {
          return {
            ...prev,
            [field]: value,
          };
        });
        break;

      default:
        popupText(`An error occurred. ${field} is not a valid field`, POPUP_STATE.FAILED);
        break;
    }
  }

  if (!sentEmail) {
    return (
      <>
        <div className="m-auto w-[80%] max-w-48 mt-6 md:mt-10 lg:mt-16 flex justify-center">
          <form
            onSubmit={handleSignUpSubmit}
            className="flex flex-col items-center gap-4 w-72 "
          >
            <h6>Welcome.</h6>
            <h1 className="text-3xl font-bold mb-4">Sign Up</h1>

            <span className="w-full flex flex-col gap-2">
              <label className="text-sm" htmlFor="email">
                Email Address
              </label>
              <input
                className="p-2 pl-4 bg-peach rounded-full w-full"
                placeholder="kwaku@ananse.com"
                type="email"
                name="email"
                id="email"
                onChange={handleValueChange}
                required
              />
            </span>
            <span className="w-full relative">
              <input
                className="p-2 pl-4 bg-peach rounded-full w-full"
                placeholder="superSecretPassword"
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                onChange={handleValueChange}
                minLength={8}
                required
              />
              <div
                className="absolute right-[5px] top-[5px] h-[calc(100%-10px)] aspect-square p-1 rounded-full bg-white hover:bg-gray-50 duration-150 cursor-pointer text-darkRed flex items-center justify-center"
                onClick={() => {
                  setShowPassword((prev) => !prev);
                }}
              >
                <FontAwesomeIcon
                  width={15}
                  height={15}
                  icon={showPassword ? faEyeSlash : faEye}
                />
              </div>
            </span>
            <button
              className="rounded-full w-full mb-4"
              disabled={submitted || !verified}
            >
              <div
                style={{ display: submitted ? "block" : "none" }}
                id="loading"
              ></div>
              <span style={{ display: submitted ? "none" : "block" }}>
                Get Orderly
              </span>
            </button>
            <HCaptcha
              ref={captchaRef}
              sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
              onVerify={() => setVerified(true)}
            />
            <h3>
              Already have an account?{" "}
              <a
                href={`/auth/login?to=${destination || "/s/dashboard"}`}
                className=" text-red cursor-pointer underline underline-offset-1 hover:underline-offset-2 duration-150"
              >
                <span>Login</span>
              </a>
            </h3>
            <a
              href={`/auth/forgot?to=${destination}`}
              className="cursor-pointer no-underline hover:underline duration-150"
            >
              <h4>Forgot Password?</h4>
            </a>
          </form>
        </div>
      </>
    );
  } else {
    return (
      <>
        <div className="m-auto w-[80%] md:mt-10 lg:mt-16  flex justify-center">
          <div className="flex flex-col items-center gap-4 w-72 ">
            <h6>Almost done.</h6>
            <h1 className="text-3xl text-center font-bold">Check your mail</h1>
            <p className="text-center mb-4">
              We've sent you an email!
              <br />
              Click on the link in the email to verify your email address.
            </p>
          </div>
        </div>
      </>
    );
  }
}

