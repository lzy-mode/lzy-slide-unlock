"use strict";

const vue = require("vue");

const DEFAULT_LABEL = "滑动完成取货";
const STYLE_ID = "slide-unlock-style";
const STYLE_CONTENT = `.slide-unlock {
  --slide-unlock-width: 680px;
  --slide-unlock-height: 80px;
  --slide-unlock-bg: #2f9d32;
  --slide-unlock-mask: rgb(222 235 230 / 0.62);
  --slide-unlock-text: #ffffff;
  --slide-unlock-text-size: 28px;
  --slide-unlock-handle: #ffffff;
  --slide-unlock-arrow: #279b35;
  position: relative;
  width: var(--slide-unlock-width);
  height: var(--slide-unlock-height);
  overflow: hidden;
  border-radius: 0;
  background: var(--slide-unlock-bg);
  color: var(--slide-unlock-text);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  user-select: none;
  touch-action: none;
  box-sizing: border-box;
}
.slide-unlock *, .slide-unlock *::before, .slide-unlock *::after { box-sizing: border-box; }
.slide-unlock__mask { position: absolute; inset: 0 auto 0 0; width: 0; background: var(--slide-unlock-mask); transition: width 180ms ease; }
.slide-unlock__text { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 0 calc(var(--slide-unlock-height) + 16px); color: var(--slide-unlock-text); font-size: var(--slide-unlock-text-size); font-weight: 700; letter-spacing: 0; line-height: 1; white-space: nowrap; opacity: 0.95; transition: opacity 160ms ease; }
.slide-unlock__handle { position: absolute; top: 4px; left: 8px; width: calc(var(--slide-unlock-height) - 8px); height: calc(var(--slide-unlock-height) - 8px); display: flex; align-items: center; justify-content: center; border: 0; border-radius: 4px; background: var(--slide-unlock-handle); cursor: grab; box-shadow: 0 1px 1px rgb(0 0 0 / 0.08); transition: transform 180ms ease; appearance: none; -webkit-tap-highlight-color: transparent; }
.slide-unlock__handle:active { cursor: grabbing; }
.slide-unlock__handle::before, .slide-unlock__handle::after { content: ""; width: calc(var(--slide-unlock-height) * 0.28); height: calc(var(--slide-unlock-height) * 0.28); border-top: max(3px, calc(var(--slide-unlock-height) * 0.05)) solid var(--slide-unlock-arrow); border-right: max(3px, calc(var(--slide-unlock-height) * 0.05)) solid var(--slide-unlock-arrow); transform: rotate(45deg); }
.slide-unlock__handle::before { opacity: 0.42; margin-right: calc(var(--slide-unlock-height) * -0.09); }
.slide-unlock__handle::after { opacity: 1; }
.slide-unlock.is-dragging .slide-unlock__mask, .slide-unlock.is-dragging .slide-unlock__handle { transition: none; }
.slide-unlock.is-dragging .slide-unlock__text { opacity: 0.45; }
.slide-unlock.is-success .slide-unlock__mask { background: transparent; }
.slide-unlock.is-disabled { opacity: 0.65; pointer-events: none; }`;

function injectStyle() {
  if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = STYLE_CONTENT;
  document.head.appendChild(style);
}

function toCssSize(value) {
  return typeof value === "number" ? `${value}px` : value;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getClientX(event) {
  return event.touches?.[0]?.clientX ?? event.changedTouches?.[0]?.clientX ?? event.clientX;
}

const SlideUnlock = vue.defineComponent({
  name: "SlideUnlock",
  props: {
    text: { type: String, default: DEFAULT_LABEL },
    width: { type: [Number, String], default: "680px" },
    height: { type: [Number, String], default: "80px" },
    bgColor: { type: String, default: "#2f9d32" },
    maskColor: { type: String, default: "rgb(222 235 230 / 0.62)" },
    textColor: { type: String, default: "#ffffff" },
    textSize: { type: [Number, String], default: "28px" },
    handleColor: { type: String, default: "#ffffff" },
    arrowColor: { type: String, default: "#279b35" },
    disabled: { type: Boolean, default: false },
    successThreshold: { type: Number, default: 0.96 },
    resetOnSuccess: { type: Boolean, default: true }
  },
  emits: ["change", "success", "reset"],
  setup(props, { attrs, emit, expose }) {
    injectStyle();
    const rootRef = vue.ref(null);
    const handleRef = vue.ref(null);
    const dragging = vue.ref(false);
    const success = vue.ref(false);
    const value = vue.ref(0);
    const startX = vue.ref(0);
    const startValue = vue.ref(0);
    const cssVars = vue.computed(() => ({
      "--slide-unlock-width": toCssSize(props.width),
      "--slide-unlock-height": toCssSize(props.height),
      "--slide-unlock-bg": props.bgColor,
      "--slide-unlock-mask": props.maskColor,
      "--slide-unlock-text": props.textColor,
      "--slide-unlock-text-size": toCssSize(props.textSize),
      "--slide-unlock-handle": props.handleColor,
      "--slide-unlock-arrow": props.arrowColor
    }));
    const maxValue = () => {
      const rootWidth = rootRef.value?.clientWidth ?? 0;
      const handleWidth = handleRef.value?.offsetWidth ?? 0;
      return Math.max(0, rootWidth - handleWidth - 8);
    };
    const percent = () => {
      const max = maxValue();
      return max === 0 ? 1 : value.value / max;
    };
    const update = (nextValue, shouldEmit = true) => {
      value.value = clamp(nextValue, 0, maxValue());
      if (shouldEmit) emit("change", percent());
    };
    const complete = () => {
      success.value = true;
      update(maxValue());
      emit("success");
      if (props.resetOnSuccess) {
        success.value = false;
        update(0, false);
      }
    };
    const reset = () => {
      success.value = false;
      dragging.value = false;
      update(0, false);
      emit("reset");
    };
    const onMove = (event) => {
      if (!dragging.value) return;
      event.preventDefault?.();
      update(startValue.value + getClientX(event) - startX.value);
    };
    const stopDrag = () => {
      if (!dragging.value) return;
      dragging.value = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", stopDrag);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", stopDrag);
      if (percent() >= props.successThreshold) complete();
      else update(0);
    };
    const startDrag = (event) => {
      if (props.disabled || success.value) return;
      dragging.value = true;
      startX.value = getClientX(event);
      startValue.value = value.value;
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", stopDrag);
      window.addEventListener("touchmove", onMove, { passive: false });
      window.addEventListener("touchend", stopDrag);
    };
    const onKeydown = (event) => {
      if (props.disabled || success.value) return;
      const step = Math.max(8, maxValue() / 12);
      if (event.key === "ArrowRight") {
        event.preventDefault();
        update(value.value + step);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        update(value.value - step);
      }
      if (event.key === "Enter" && percent() >= props.successThreshold) complete();
    };
    vue.nextTick(() => update(0, false));
    vue.watch(() => [props.width, props.height], () => {
      vue.nextTick(() => update(value.value, false));
    });
    vue.onBeforeUnmount(() => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", stopDrag);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", stopDrag);
    });
    expose({ reset, complete, getPercent: percent });
    return () => vue.h("div", {
      ...attrs,
      ref: rootRef,
      class: ["slide-unlock", { "is-dragging": dragging.value, "is-success": success.value, "is-disabled": props.disabled }, attrs.class],
      style: [cssVars.value, attrs.style],
      role: "group"
    }, [
      vue.h("div", {
        class: "slide-unlock__mask",
        style: { width: `${value.value + (handleRef.value?.offsetWidth ?? 0) + 8}px` }
      }),
      vue.h("div", { class: "slide-unlock__text" }, props.text),
      vue.h("button", {
        ref: handleRef,
        class: "slide-unlock__handle",
        type: "button",
        disabled: props.disabled,
        "aria-label": props.text,
        "aria-valuenow": Math.round(percent() * 100),
        style: { transform: `translateX(${value.value}px)` },
        onMousedown: startDrag,
        onTouchstart: startDrag,
        onKeydown
      })
    ]);
  }
});

SlideUnlock.install = (app) => {
  app.component(SlideUnlock.name, SlideUnlock);
};

module.exports = SlideUnlock;
module.exports.default = SlideUnlock;
module.exports.SlideUnlock = SlideUnlock;
