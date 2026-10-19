import React from "react";
import logo from "../assets/images/img_Logo.png";

interface BrandLogoProps {
  alt?: string;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  alt = "DARBS",
  className = "h-full w-full object-contain",
}) => <img src={logo} alt={alt} className={className} />;
