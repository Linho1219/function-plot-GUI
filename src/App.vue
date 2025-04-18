<template>
  <Navbar />
  <div id="content" :class="{ onresize: onResize }">
    <div id="editor" :style="{ width: sideRatio + 'vw' }">
      <div class="editor-inner">
        <VueDraggable
          v-model="graphData"
          :animation="150"
          handle=".datablock-drag"
        >
          <DataBlock
            v-for="(dataItem, i) in graphData"
            v-model="graphData[i]"
            @delete="graphData.splice(i, 1)"
            :key="dataItem.key"
            @require-full-update="fullUpdate"
          />
        </VueDraggable>
        <div class="plot-data add-data">
          <div
            @click="graphData.push({ key: Math.random() })"
            class="add-data-opt add"
          >
            + 添加
          </div>
          <div @click="handleImport()" class="add-data-opt import">↓ 导入</div>
        </div>
      </div>
      <CodeDisplay :dataArr="cloneArr(graphData)" />
    </div>
    <div id="divider" @mousedown="handleDrag"></div>
    <div id="graph" ref="shellRef">
      <Graph
        :data="cloneArr(graphData)"
        :width="graphWidth"
        :height="graphHeight"
        :key="key"
        @requireFullUpdate="fullUpdate"
        @requirePostUpdate="key++"
        v-model="fullUpdateState"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Navbar from "./components/nav.vue";
import Graph from "./components/graph.vue";
import DataBlock from "./components/dataBlock.vue";
import CodeDisplay from "./components/codeDisplay.vue";
import { VueDraggable } from "vue-draggable-plus";
import type { FunctionPlotDatum, FunctionPlotOptions } from "function-plot";
import { onMounted, ref } from "vue";
import { cloneDeep } from "lodash-es";
import JSON5 from "json5";
import base64 from "base-64";
import utf8 from "utf8";
import { Datum } from "./consts";

const graphData = ref<Datum[]>([{ fn: "x^2", key: 1 }]);

const graphWidth = ref(0),
  graphHeight = ref(0);
const key = ref(0);
const fullUpdateState = ref(false);
const sideRatio = ref(33);
const onResize = ref(false);
const shellRef = ref<HTMLDivElement>();
function handleResize() {
  if (shellRef.value) {
    graphWidth.value = shellRef.value.clientWidth;
    graphHeight.value = shellRef.value.clientHeight;
  }
}

function cloneArr<T extends Object[]>(obj: T) {
  const cloned = cloneDeep(obj);
  function removeUndefined(obj: Record<string, any>) {
    for (const key in obj) {
      console.log(1);
      if (obj[key] === undefined) delete obj[key];
      if (
        typeof obj[key] === "object" &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      )
        removeUndefined(obj[key]);
    }
  }
  cloned.forEach((item) => removeUndefined(item));
  return cloned as T;
}

function importMapper(item: FunctionPlotDatum): Datum {
  if (item.graphType === "text")
    return {
      ...item,
      fnType: "text",
      key: Math.random(),
    };
  else
    return {
      ...item,
      key: Math.random(),
    };
}

function fullUpdate() {
  fullUpdateState.value = true;
  key.value++;
}

onMounted(() => {
  const rawCode = window.location.search.match(/\?code=(.+)$/)?.[1];
  if (rawCode)
    try {
      const code = utf8.decode(base64.decode(decodeURIComponent(rawCode)));
      const data = (<FunctionPlotDatum[]>JSON5.parse(code).data).map(
        importMapper
      );
      graphData.value = <Datum[]>data;
      console.log(code);
      console.log(data);
    } catch (e) {}

  window.addEventListener("resize", handleResize);
  handleResize();
});

function handleDrag() {
  onResize.value = true;
  const xfull = window.innerWidth;
  const mousemove = (event: MouseEvent) =>
    (sideRatio.value = (event.clientX / xfull) * 100);
  document.addEventListener("mousemove", mousemove);
  document.addEventListener("mouseup", () => {
    document.removeEventListener("mousemove", mousemove);
    onResize.value = false;
    handleResize();
  });
}

function handleImport() {
  const raw = prompt("源数据：");
  if (!raw) return;
  graphData.value =
    (<FunctionPlotOptions>JSON5.parse(raw)).data?.map(importMapper) ?? [];
}
</script>

<style>
#app {
  position: fixed;
  margin: 0;
  padding: 0;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100vh;
  display: flex;
  flex-wrap: nowrap;
  flex-direction: column;
}
#content {
  width: 100vw;
  flex-grow: 1;
  display: flex;
  max-height: calc(100vh - 50px);
}
#navbar {
  height: 50px;
  width: 100vw;
  background: var(--c-bk1);
  border-bottom: var(--c-border) 1px solid;
  position: relative;
  flex-shrink: 0;
}
#editor {
  border-right: var(--c-border) 1px solid;
  position: relative;
}
.editor-inner {
  overflow: scroll;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 300px;
}
#graph {
  flex-grow: 1;
  position: relative;
  overflow: hidden;
}
.add-data {
  padding: 0;
  display: flex;
  flex-direction: row;
  cursor: default;
}
.add-data-opt {
  padding: 10px 30px;
}
.add-data-opt.add {
  flex-grow: 1;
}
.add-data-opt:not(:nth-child(1)) {
  border-left: 1px solid var(--c-border);
}
.editor-inner {
  padding-bottom: 50px;
}
.add-data-opt:hover {
  background: var(--c-bk3);
}
.add-data-opt:active {
  background: var(--c-bk1);
}

#divider {
  width: 6px;
  background: var(--c-accent);
  margin-left: -3px;
  margin-right: -3px;
  z-index: 999;
  opacity: 0;
  transition: opacity 0.1s;
  cursor: w-resize;
}
#divider:hover {
  opacity: 0.8;
}
.onresize #divider {
  opacity: 0.3;
  transition: none;
}
.onresize {
  cursor: w-resize;
  user-select: none;
}
</style>
