"use client";

import { QRCodeSVG } from "qrcode.react";

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  level?: "L" | "M" | "Q" | "H";
  includeMargin?: boolean;
}

export default function QRCodeGenerator({
  value,
  size = 128,
  level = "H",
  includeMargin = true,
}: QRCodeGeneratorProps) {
  return (
    <div className="flex items-center justify-center">
      <QRCodeSVG
        value={value}
        size={size}
        level={level}
        includeMargin={includeMargin}
        className="rounded-lg border border-slate-200 bg-white p-2 shadow-xs"
      />
    </div>
  );
}
