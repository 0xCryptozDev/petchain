import sharedConfig from "../../../tailwind.config.js";
import { fileURLToPath } from "node:url";

const source = (path) =>
  fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/");

export default {
  ...sharedConfig,
  content: [
    source("./index.html"),
    source("./*.{js,jsx}"),
    source("../vet/**/*.{js,jsx}"),
  ],
  theme: {
    ...sharedConfig.theme,
    extend: {
      ...sharedConfig.theme?.extend,
      colors: {
        ink: "#392e28",
        muted: "#756354",
        action: "#c64f29",
        "action-deep": "#92371d",
        canvas: "#fff7ed",
        line: "#eadfd2",
        control: "#a38b76",
        "accent-soft": "#f5e8d9",
      },
      fontFamily: { sans: ["Noto Sans Thai", "Tahoma", "sans-serif"] },
      screens: { wide: "1181px" },
    },
  },
};
