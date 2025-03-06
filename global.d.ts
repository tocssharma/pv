// global.d.ts
declare module "./src/components/ui/button" {
  export const Button: React.FC<{
    variant?: string;
    size?: string;
    className?: string;
    onClick?: () => void;
    children?: React.ReactNode;
  }>;
}

declare module "./src/components/ui/slider" {
  export const Slider: React.FC<{
    className?: string;
    value?: number[];
    min?: number;
    max?: number;
    step?: number;
    onValueChange?: (values: number[]) => void;
  }>;
}

declare module "./src/lib/utils" {
  export function cn(...inputs: any[]): string;
}