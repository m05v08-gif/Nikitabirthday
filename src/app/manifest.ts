import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Для нас",
    short_name: "Для нас",
    description: "Истории и идеи на вечер — для нас двоих",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f1e8",
    theme_color: "#0b1220",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      }
    ]
  };
}
