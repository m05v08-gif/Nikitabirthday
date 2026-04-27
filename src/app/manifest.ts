import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Подарок",
    short_name: "Подарок",
    description: "Истории и идеи на вечер — для нас двоих",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f1e8",
    theme_color: "#0b1220",
    icons: [
      {
        src: "/icon.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icon.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}
