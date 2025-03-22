"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import Card from "@mui/material/Card";
import { Typography } from "@mui/material";
import Image from "next/image";

export default function NavigationSlider() {
  return (
    <>
      <Card
        sx={{
          boxShadow: "none",
          borderRadius: "10px",
          p: "25px",
          mb: "15px",
        }}
      >
        <Typography
          as="h3"
          sx={{
            fontSize: 18,
            fontWeight: 500,
            mb: "10px",
          }}
        >
          Navigation
        </Typography>

        <Swiper navigation={true} modules={[Navigation]} className="mySwiper">
          <SwiperSlide>
            <Image
              src="/images/slider-img3.jpg"
              alt="Image"
              width={800}
              height={650}
            />
          </SwiperSlide>

          <SwiperSlide>
            <Image
              src="/images/slider-img4.jpg"
              alt="Image"
              width={800}
              height={650}
            />
          </SwiperSlide>

          <SwiperSlide>
            <Image
              src="/images/slider-img5.jpg"
              alt="Image"
              width={800}
              height={650}
            />
          </SwiperSlide>

          <SwiperSlide>
            <Image
              src="/images/slider-img1.jpg"
              alt="Image"
              width={800}
              height={650}
            />
          </SwiperSlide>

          <SwiperSlide>
            <Image
              src="/images/slider-img2.jpg"
              alt="Image"
              width={800}
              height={650}
            />
          </SwiperSlide>
        </Swiper>
      </Card>
    </>
  );
}
