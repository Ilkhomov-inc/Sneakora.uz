"use client";

import Image, { type ImageLoader, type ImageProps } from "next/image";

// Photos from the brands' CDNs are already optimized there: ask the CDN for the needed width
// instead of re-encoding on our server. Uploaded photos (/uploads/...) go through Next.js.
const cdnLoader: ImageLoader = ({ src, width }) => {
  if (src.includes("static.nike.com/a/images/t_default/")) {
    return src.replace("/t_default/", `/t_default/f_auto,q_auto,w_${width}/`);
  }
  if (src.includes("static.nike.com/a/images/")) {
    return src.replace(/\/w_\d+,c_limit\//, `/w_${width},c_limit/`);
  }
  if (src.includes("images.puma.com/image/upload/")) {
    return /w_\d+,h_\d+/.test(src) ? src.replace(/w_\d+,h_\d+/, `w_${width},h_${width}`) : src.replace(/w_\d+/, `w_${width}`);
  }
  if (src.includes("adidas.com.cn/")) {
    return src.replace(/Resize=\((\d+),(\d+)\)/, (_, w, h) => `Resize=(${width},${Math.round((width * Number(h)) / Number(w))})`);
  }
  return src;
};

const RESIZABLE_HOSTS = ["static.nike.com", "images.puma.com", "adidas.com.cn"];

export function SmartImage({ alt, ...props }: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  const remote = /^https?:\/\//.test(src);
  if (!remote) return <Image alt={alt} {...props} />;
  const resizable = RESIZABLE_HOSTS.some((host) => src.includes(host));
  return resizable ? <Image alt={alt} loader={cdnLoader} {...props} /> : <Image alt={alt} unoptimized {...props} />;
}
