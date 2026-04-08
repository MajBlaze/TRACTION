"use client";

import Image from "next/image";
import logo from "@/lib/TRACTION-LOGO.png";
import { cn } from "@/lib/utils";

type TractionLogoProps = {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

export function TractionLogo({
  className,
  imageClassName,
  priority = false,
}: TractionLogoProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl ring-4 ring-primary/20 shadow-2xl bg-card/60",
        className
      )}
    >
      <Image
        src={logo}
        alt="TRACTION logo"
        fill
        priority={priority}
        sizes="(max-width: 768px) 80px, 96px"
        className={cn("object-cover", imageClassName)}
      />
    </div>
  );
}
