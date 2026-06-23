import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import { initNative } from "./app/lib/native";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(<App />);

  // Inicialização nativa (status bar / esconder splash). No web é no-op.
  void initNative();
