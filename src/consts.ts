import type {
  FunctionPlotAnnotation,
  FunctionPlotDatum,
  FunctionPlotOptions,
} from "function-plot";
import cloneDeep from "lodash-es/cloneDeep";

export type ValueLabel = { value: string; label: string; default?: boolean };

/** 字段列表 */
export const inputTypeArr = [
  "fn",
  "x",
  "y",
  "r",
  "vector",
  "offset",
  "range",
  "closed",
  "text",
  "location",
  "points",
] as const;

/** 文本字段类型 */
export type InputType = {
  value: "fn" | "x" | "y" | "r" | "text";
  label: string;
  title: string;
  placeholder: string;
  optional?: boolean;
};

/** 有序数对字段类型 */
export type CoordType = {
  value: "vector" | "offset" | "range" | "location";
  label: string;
  fir: string;
  sep: string;
  fin: string;
  placeholder: [string, string];
  optional?: boolean;
  defaultVal?: [number, number];
  folded?: boolean;
};

/** 开关字段类型 */
export type SwitchType = { value: "closed"; label: string; folded?: boolean };

export type CoordArr = {
  value: "points";
  label: string;
  fir: string;
  sep: string;
  fin: string;
  placeholder: [string, string];
};

export type OptInput = {
  label: string;
  placeholder?: string;
  vif?: keyof FunctionPlotDatum;
} & ({ value: "color"; type: "text" } | { value: "nSamples"; type: "number" });

export type FnType = {
  value: FunctionPlotDatum["fnType"] | "text";
  label: string;
  inputs: InputType[];
  coord?: CoordType[];
  coordArr?: CoordArr;
  switches?: SwitchType[];
  optInput?: OptInput[];
  allowedGraphType?: ValueLabel[];
  default?: boolean;
};

export type InternalDatum = Omit<FunctionPlotDatum, "fnType" | "graphType"> & {
  fnType: "text" | NonNullable<FunctionPlotDatum["fnType"]>;
  graphType: NonNullable<FunctionPlotDatum["graphType"]>;
  key: number;
  hidden?: boolean;
};

export function getNewDatum(): InternalDatum {
  return {
    key: Math.random(),
    fnType: "linear",
    graphType: "polyline",
    fn: "",
  };
}

export function toOriginalDatum(items: InternalDatum[], forExport?: boolean) {
  const cloned = cloneDeep(items);
  return cloned.flatMap((item) => {
    if (item.hidden)
      if (forExport) return [];
      else
        return {
          fnType: "points",
          graphType: "polyline",
          points: [],
        };
    const fnType = item.fnType;
    const graphType = item.graphType;
    const graphTypeObj = getAllowedGraphType(fnType).find(
      (item) => item.value === graphType
    );
    if (!graphTypeObj) throw new Error("graphType not found: " + graphType);
    if (getFnType(fnType).default) {
      delete (<any>item).fnType;
    }
    if ("default" in graphTypeObj && graphTypeObj.default) {
      delete (<any>item).graphType;
    }
    delete (<any>item).key;
    delete (<any>item).hidden;
    return item;
  }) as FunctionPlotDatum[];
}
export function toInternalDatum(items: FunctionPlotDatum[]) {
  const cloned = cloneDeep(items) as InternalDatum[];
  cloned.forEach((item, index) => {
    const clonedItem = cloned[index];
    if (item.graphType === "text") {
      clonedItem.fnType = "text";
    }
    if (item.fnType === undefined) {
      clonedItem.fnType = "linear";
    }
    if (item.graphType === undefined) {
      clonedItem.graphType = "interval";
    }
    clonedItem.key = Math.random();
  });
  return cloned;
}

export type InputProps = {
  dataItem: InternalDatum;
  fnType: FnType;
};

export type InputPropsWithFold = {
  dataItem: InternalDatum;
  fnType: FnType;
  blockFolded: boolean;
};

export const getFnType = (fnType: string = "linear") =>
  <FnType>fnTypeArr.find(({ value }) => value === fnType);

/** graphType 字段选项 */
export const getAllowedGraphType = (fnType: string) => {
  const fnTypeObj = fnTypeArr.find(({ value }) => value === fnType);
  if (!fnTypeObj) throw new Error("fnType not found: " + fnType);
  return fnTypeObj.allowedGraphType;
};

export const fnTypeArr = [
  {
    default: true,
    value: "linear",
    label: "fnType.linear",
    allowedGraphType: [
      { value: "polyline", label: "graphType.polyline" },
      { value: "interval", label: "graphType.interval", default: true },
      { value: "scatter", label: "graphType.scatter" },
    ],
    inputs: [{ value: "fn", label: "函数", title: "y=", placeholder: "f(x)" }],
    coord: [
      {
        value: "range",
        label: "",
        fir: "x ∈ [",
        sep: ",",
        fin: "]",
        placeholder: ["-Inf", "+Inf"],
        optional: true,
        defaultVal: [-Infinity, Infinity],
        folded: true,
      },
    ],
    switches: [{ value: "closed", label: "inputs.closed", folded: true }],
    optInput: [
      {
        value: "color",
        type: "text",
        label: "inputs.color",
        placeholder: "inputs.colorPlaceholder",
      },
      {
        value: "nSamples",
        type: "number",
        label: "inputs.nSamples",
        placeholder: "inputs.nSamplesPlaceholder",
      },
    ],
  },
  {
    value: "implicit",
    label: "fnType.implicit",
    allowedGraphType: [
      { value: "interval", label: "graphType.interval", default: true },
    ],
    inputs: [
      { value: "fn", label: "函数", title: "0=", placeholder: "f(x, y)" },
    ],
    switches: [{ value: "closed", label: "inputs.closed", folded: true }],
    optInput: [
      {
        value: "color",
        type: "text",
        label: "inputs.color",
        placeholder: "inputs.colorPlaceholder",
      },
      {
        value: "nSamples",
        type: "number",
        label: "inputs.nSamples",
        placeholder: "inputs.nSamplesPlaceholder",
      },
    ],
  },
  {
    value: "parametric",
    label: "fnType.parametric",
    allowedGraphType: [
      { value: "polyline", label: "graphType.polyline" },
      { value: "scatter", label: "graphType.scatter" },
    ],
    inputs: [
      { value: "x", label: "x", title: "x=", placeholder: "f(t)" },
      { value: "y", label: "y", title: "y=", placeholder: "g(t)" },
    ],
    coord: [
      {
        value: "range",
        label: "",
        fir: "t ∈ [",
        sep: ",",
        fin: "]",
        placeholder: ["0", "2π"],
        optional: true,
        defaultVal: [0, 2 * Math.PI],
        folded: true,
      },
    ],
    switches: [{ value: "closed", label: "inputs.closed", folded: true }],
    optInput: [
      {
        value: "color",
        type: "text",
        label: "inputs.color",
        placeholder: "inputs.colorPlaceholder",
      },
      {
        value: "nSamples",
        type: "number",
        label: "inputs.nSamples",
        placeholder: "inputs.nSamplesPlaceholder",
      },
    ],
  },
  {
    value: "polar",
    label: "fnType.polar",
    allowedGraphType: [
      { value: "polyline", label: "graphType.polyline" },
      { value: "scatter", label: "graphType.scatter" },
    ],
    inputs: [
      { value: "r", label: "半径", title: "ρ=", placeholder: "f(theta)" },
    ],
    coord: [
      {
        value: "range",
        label: "",
        fir: "θ ∈ [",
        sep: ",",
        fin: "]",
        placeholder: ["-π", "π"],
        optional: true,
        folded: true,
        defaultVal: [-Math.PI, Math.PI],
      },
    ],
    switches: [{ value: "closed", label: "inputs.closed", folded: true }],
    optInput: [
      {
        value: "color",
        type: "text",
        label: "inputs.color",
        placeholder: "inputs.colorPlaceholder",
      },
      {
        value: "nSamples",
        type: "number",
        label: "inputs.nSamples",
        placeholder: "inputs.nSamplesPlaceholder",
      },
    ],
  },
  {
    value: "points",
    label: "fnType.points",
    allowedGraphType: [
      { value: "polyline", label: "graphType.polyline" },
      { value: "scatter", label: "graphType.scatter" },
    ],
    inputs: [],
    coordArr: {
      value: "points",
      label: "",
      fir: "(",
      sep: ",",
      fin: ")",
      placeholder: ["x", "y"],
    },
    switches: [{ value: "closed", label: "inputs.closed", folded: true }],
    optInput: [
      {
        value: "color",
        type: "text",
        label: "inputs.color",
        placeholder: "inputs.colorPlaceholder",
      },
    ],
  },
  {
    value: "vector",
    label: "fnType.vector",
    allowedGraphType: [
      { value: "polyline", label: "graphType.polyline" },
      { value: "scatter", label: "graphType.scatter" },
    ],
    inputs: [],
    coord: [
      {
        value: "vector",
        label: "inputs.vectorValue",
        fir: " =(",
        sep: ",",
        fin: ")",
        placeholder: ["x", "y"],
      },
      {
        value: "offset",
        label: "inputs.vectorOffset",
        fir: " =(",
        sep: ",",
        fin: ")",
        placeholder: ["0", "0"],
        optional: true,
        folded: true,
      },
    ],
    optInput: [
      {
        value: "color",
        type: "text",
        label: "inputs.color",
        placeholder: "inputs.colorPlaceholder",
      },
    ],
  },
  {
    value: "text",
    label: "fnType.text",
    allowedGraphType: [{ value: "text", label: "graphType.text" }],
    inputs: [
      {
        value: "text",
        title: "s=",
        label: "文本",
        placeholder: "Lorem ipsum dolor",
      },
    ],
    coord: [
      {
        value: "location",
        label: "inputs.location",
        fir: " =(",
        sep: ",",
        fin: ")",
        placeholder: ["x", "y"],
        defaultVal: [0, 0],
      },
    ],
    optInput: [
      {
        value: "color",
        type: "text",
        label: "inputs.color",
        placeholder: "inputs.colorPlaceholder",
      },
    ],
  },
] as const satisfies FnType[];

export type InternalAnnotation = {
  axis: "x" | "y";
  value: string;
  text: string;
  key: number;
};

export function toOriginalAnnotation(items: InternalAnnotation[]) {
  return items.map(({ axis, value, text }) => ({
    [axis]: Number(value),
    ...(text ? { text } : {}),
  })) as FunctionPlotAnnotation[];
}

export function toInternalAnnotation(items: FunctionPlotAnnotation[]) {
  const cloned: InternalAnnotation[] = [];
  items.forEach((item) => {
    let axis: "x" | "y";
    if ("x" in item && typeof item.x === "number") axis = "x";
    else axis = "y";
    const value = String(item[axis]);
    cloned.push({
      axis,
      value,
      text: item.text ?? "",
      key: Math.random(),
    });
  });
  return cloned;
}

export type InternalGraphOptions = {
  xAxis: {
    invert: boolean;
    label: string;
    type: "linear" | "log";
  };
  yAxis: {
    invert: boolean;
    label: string;
    type: "linear" | "log";
  };
  grid: boolean;
  title: string;
};

export function toInternalGraphOptions(
  original: Partial<FunctionPlotOptions>
): InternalGraphOptions {
  const { xAxis, yAxis, title, grid } = original;
  return {
    xAxis: {
      invert: xAxis?.invert ?? false,
      label: xAxis?.label ?? "",
      type: xAxis?.type ?? "linear",
    },
    yAxis: {
      invert: yAxis?.invert ?? false,
      label: yAxis?.label ?? "",
      type: yAxis?.type ?? "linear",
    },
    title: title ?? "",
    grid: grid ?? false,
  };
}

function removeUndefined(obj: object) {
  Object.entries(obj).forEach(([key, value]) => {
    if (value === undefined) {
      delete (<any>obj)[key];
    } else if (typeof value === "object" && value !== null) {
      removeUndefined(value);
    }
  });
}

export function toOriginalGraphOptions(
  internal: InternalGraphOptions
): Partial<FunctionPlotOptions> {
  const { xAxis, yAxis, title, grid } = internal;
  const checkIfDefault = (value: any, defaultValue: any) =>
    value === defaultValue ? undefined : value;
  const cloned: Partial<FunctionPlotOptions> = {
    xAxis: {
      invert: checkIfDefault(xAxis.invert, false),
      label: checkIfDefault(xAxis.label, ""),
      type: checkIfDefault(xAxis.type, "linear"),
    },
    yAxis: {
      invert: checkIfDefault(yAxis.invert, false),
      label: checkIfDefault(yAxis.label, ""),
      type: checkIfDefault(yAxis.type, "linear"),
    },
    title: checkIfDefault(title, ""),
    grid: checkIfDefault(grid, false),
  };
  removeUndefined(cloned);
  if (Object.keys(cloned.xAxis ?? {}).length === 0) delete cloned.xAxis;
  if (Object.keys(cloned.yAxis ?? {}).length === 0) delete cloned.yAxis;
  return cloned;
}
