"use client";

import React from "react";

import Image from "next/image";

const ProfileInfo = () => {
  return (
    <>
      <div >
        <div >
          <h1>Welcome to admash Dashboard!</h1>
          <p>
            You have done 68% 😎 more sales today. Check your new badge in your
            profile.
          </p>
        </div>
        <Image src="/images/shape-1.png" alt="shape" width={110} height={78} />
      </div>
    </>
  );
};

export default ProfileInfo;
