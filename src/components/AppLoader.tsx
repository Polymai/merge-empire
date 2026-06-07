import { Loader2 } from "lucide-react";

type AppLoaderProps = {
  visible: boolean;
  label: string;
};

export function AppLoader({ visible, label }: AppLoaderProps) {
  if (!visible) return null;

  return (
    <div className="app-loader" role="status" aria-busy="true">
      <div className="app-loader__panel">
        <Loader2 aria-hidden="true" className="loader-icon" />
        <span>{label}</span>
      </div>
    </div>
  );
}
