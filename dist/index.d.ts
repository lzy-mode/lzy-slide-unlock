import type { App, DefineComponent } from "vue";

export interface SlideUnlockProps {
  text?: string;
  width?: number | string;
  height?: number | string;
  bgColor?: string;
  maskColor?: string;
  textColor?: string;
  textSize?: number | string;
  handleColor?: string;
  arrowColor?: string;
  disabled?: boolean;
  successThreshold?: number;
  resetOnSuccess?: boolean;
}

export interface SlideUnlockExpose {
  reset: () => void;
  complete: () => void;
  getPercent: () => number;
}

declare const SlideUnlock: DefineComponent<SlideUnlockProps> & {
  install: (app: App) => void;
};

export { SlideUnlock };
export default SlideUnlock;
