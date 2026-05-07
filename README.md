# lzy-slide-unlock

适配 Vue 3 的滑动滑块解锁组件。组件可直接放进 `<template>` 中使用，支持外部动态设置背景色、宽高、文本等样式参数。

## 安装

```bash
npm install lzy-slide-unlock
```

## 使用

```vue
<template>
  <SlideUnlock text="滑动完成取货" width="100vw" height="50px" bgColor="#342234" />
</template>

<script setup>
import SlideUnlock from "lzy-slide-unlock";
</script>
```

动态设置：

```vue
<template>
  <SlideUnlock
    :text="unlockText"
    :width="width"
    :height="height"
    :bgColor="bgColor"
    :resetOnSuccess="true"
    @success="handleSuccess"
  />
</template>

<script setup>
import { ref } from "vue";
import SlideUnlock from "lzy-slide-unlock";

const unlockText = ref("滑动完成取货");
const width = ref("100vw");
const height = ref("50px");
const bgColor = ref("#342234");

function handleSuccess() {
  console.log("解锁成功");
}
</script>
```

## Props

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `text` | `string` | `滑动完成取货` | 中间显示文本 |
| `width` | `number \| string` | `680px` | 组件宽度，数字会自动转为 px |
| `height` | `number \| string` | `80px` | 组件高度，数字会自动转为 px |
| `bgColor` | `string` | `#2f9d32` | 背景色 |
| `maskColor` | `string` | `rgb(222 235 230 / 0.62)` | 拖动时左侧遮罩色 |
| `textColor` | `string` | `#ffffff` | 文本颜色 |
| `textSize` | `number \| string` | `28px` | 文本字号 |
| `handleColor` | `string` | `#ffffff` | 滑块颜色 |
| `arrowColor` | `string` | `#279b35` | 箭头颜色 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `successThreshold` | `number` | `0.96` | 完成阈值，范围 0-1 |
| `resetOnSuccess` | `boolean` | `true` | 滑动成功后是否自动回到初始状态 |

## Events

| 事件 | 说明 |
| --- | --- |
| `change` | 拖动时触发，返回当前进度 0-1 |
| `success` | 滑动到阈值后触发，是否回到初始状态由 `resetOnSuccess` 控制 |
| `reset` | 调用组件实例 `reset()` 后触发 |

## 实例方法

```vue
<template>
  <SlideUnlock ref="unlockRef" text="滑动完成取货" />
  <button @click="unlockRef?.reset()">重置</button>
</template>

<script setup>
import { ref } from "vue";
import SlideUnlock from "lzy-slide-unlock";

const unlockRef = ref();
</script>
```

- `reset()`：重置到初始位置。
- `complete()`：手动置为完成状态。
- `getPercent()`：获取当前滑动进度。
