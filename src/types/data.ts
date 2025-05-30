import { FunctionPlotDatum, FunctionPlotDatumSecant } from "function-plot";
import { omitAttr, amendAttr } from "./utils";
import cloneDeep from "lodash-es/cloneDeep";

export namespace PrivateDataTypes {
  type Global = {
    /** @private */
    key: number;
    color: string;
    hidden: boolean;
  };
  type Function = Global & {
    closed: boolean;
  };

  export const allowedGraphTypes = {
    linear: ["interval", "polyline", "scatter"],
    implicit: ["interval"],
    parametric: ["polyline", "scatter"],
    polar: ["polyline", "scatter"],
    points: ["polyline", "scatter"],
    vector: ["polyline"],
    text: ["text"],
  } as const;

  export namespace LinearPart {
    export type Derivative = {
      fn: string;
      x0?: number;
      updateOnMouseMove: boolean;
    };
    export type Secant = {
      x0: number;
      x1?: number;
      updateOnMouseMove: boolean;
    };
  }

  export const defaultRange = {
    linear: [-Infinity, Infinity],
    parametric: [0, 2 * Math.PI],
    polar: [-Math.PI, Math.PI],
  } as const;

  /** Normal functions: y=f(x) */
  export type Linear = Function & {
    fnType: "linear";
    graphType: (typeof allowedGraphTypes)["linear"][number];
    fn: string;
    secants: LinearPart.Secant[];
    derivative: undefined | LinearPart.Derivative;
    range: [number, number];
    nSamples: number | undefined;
    skipTip: boolean;
  };
  /** Implicit functions: F(x,y)=0 */
  export type Implicit = Function & {
    fnType: "implicit";
    graphType: "interval";
    fn: string;
  };
  /** Parametric functions: x=f(t), y=g(t) */
  export type Parametric = Function & {
    fnType: "parametric";
    graphType: (typeof allowedGraphTypes)["parametric"][number];
    x: string;
    y: string;
    range: [number, number];
    nSamples: number | undefined;
  };
  /** Polar functions: r=f(t) */
  export type Polar = Function & {
    fnType: "polar";
    graphType: (typeof allowedGraphTypes)["polar"][number];
    r: string;
    range: [number, number];
    nSamples: number | undefined;
  };
  /** Points */
  export type Points = Global & {
    fnType: "points";
    graphType: (typeof allowedGraphTypes)["points"][number];
    points: [number, number][];
    closed: boolean;
  };
  /** Vector */
  export type Vector = Global & {
    fnType: "vector";
    graphType: (typeof allowedGraphTypes)["vector"][number];
    vector: [number, number];
    offset: [number, number];
  };
  /** Text */
  export type Text = Global & {
    fnType: "text";
    graphType: (typeof allowedGraphTypes)["text"][number];
    text: string;
    location: [number, number];
  };

  export type Combined =
    | Linear
    | Implicit
    | Parametric
    | Polar
    | Points
    | Vector
    | Text;

  export type Functions = Linear | Implicit | Parametric | Polar;

  export type Full = Linear &
    Implicit &
    Parametric &
    Polar &
    Points &
    Vector &
    Text;
}
export type PrivateData = PrivateDataTypes.Combined;

export function toPublicData(data: PrivateData): FunctionPlotDatum {
  if (data.fnType === "text")
    return omitAttr(
      {
        ...cloneDeep(data),
        fnType: undefined,
      },
      {
        key: () => true,
        fnType: () => true,
        hidden: false,
        color: "",
      }
    );

  return omitAttr(
    cloneDeep({
      ...data,
      range: ((): [number, number] | undefined => {
        if (!("range" in data)) return undefined;
        let [min, max] = data.range;
        let [defaultMin, defaultMax] =
          PrivateDataTypes.defaultRange[data.fnType];
        if (min === defaultMin && max === defaultMax) return undefined;
        return data.range;
      })(),
      derivative: (() => {
        if (!("derivative" in data) || data.derivative === undefined)
          return undefined;
        const { updateOnMouseMove } = data.derivative;
        return omitAttr(data.derivative, {
          x0: () => updateOnMouseMove,
          updateOnMouseMove: false,
        }) as FunctionPlotDatumSecant;
      })(),
      secants: (() => {
        if (!("secants" in data) || data.secants.length === 0) return undefined;
        return data.secants.map((secant) => {
          const { updateOnMouseMove } = secant;
          return omitAttr(secant, {
            x1: () => updateOnMouseMove,
            updateOnMouseMove: false,
          }) as FunctionPlotDatumSecant;
        });
      })(),
    }),
    {
      key: () => true,
      fnType: "linear",
      graphType: "interval",
      skipTip: false,
      closed: false,
      hidden: false,
      color: "",
      nSamples: undefined,
      range: (val) => val === undefined,
      derivative: (val) => val === undefined,
      secants: (val) => val === undefined,
      offset: ([x, y]) => !x && !y,
    }
  );
}

export function toPrivateData(input: Object) {
  const data = input as Partial<PrivateData>;
  const getGlobals = () => ({
    key: Math.random(),
    color: "",
    hidden: false,
  });
  const getFunctionGlobals = () => ({
    ...getGlobals(),
    closed: false,
  });
  switch (data.fnType) {
    case "text":
    // @ts-ignore expected case fallthrough
    case undefined:
      if (
        data.fnType === "text" ||
        ("text" in data && typeof data.text === "string")
      )
        return amendAttr<PrivateDataTypes.Text>(data, {
          fnType: "text",
          graphType: "text",
          text: "",
          location: () => [0, 0],
          ...getGlobals(),
        });
    // else: fallthrough to linear
    case "linear":
      return amendAttr<PrivateDataTypes.Linear>(
        data as Partial<PrivateDataTypes.Linear>,
        {
          fnType: "linear",
          graphType: "interval",
          fn: "",
          secants: ({ secants = [] }) =>
            secants.map((secant) =>
              amendAttr(secant, {
                x0: 0,
                x1: 1,
                updateOnMouseMove: false,
              })
            ),
          derivative: ({ derivative }) =>
            !derivative
              ? undefined
              : amendAttr(derivative, {
                  fn: "",
                  x0: 0,
                  updateOnMouseMove: false,
                }),
          skipTip: false,
          nSamples: undefined,
          range: () => [...PrivateDataTypes.defaultRange.linear],
          ...getFunctionGlobals(),
        }
      );
    case "implicit":
      return amendAttr<PrivateDataTypes.Implicit>(data, {
        fnType: "implicit",
        graphType: "interval",
        fn: "",
        ...getFunctionGlobals(),
      });
    case "polar":
      return amendAttr<PrivateDataTypes.Polar>(data, {
        fnType: "polar",
        graphType: "polyline",
        r: "",
        nSamples: undefined,
        range: () => [...PrivateDataTypes.defaultRange.polar],
        ...getFunctionGlobals(),
      });
    case "parametric":
      return amendAttr<PrivateDataTypes.Parametric>(data, {
        fnType: "parametric",
        graphType: "polyline",
        x: "",
        y: "",
        nSamples: undefined,
        range: () => [...PrivateDataTypes.defaultRange.parametric],
        ...getFunctionGlobals(),
      });
    case "points":
      return amendAttr<PrivateDataTypes.Points>(data, {
        fnType: "points",
        graphType: "polyline",
        points: () => [],
        closed: false,
        ...getGlobals(),
      });
    case "vector":
      return amendAttr<PrivateDataTypes.Vector>(data, {
        fnType: "vector",
        graphType: "polyline",
        vector: () => [1, 1],
        offset: () => [0, 0],
        ...getGlobals(),
      });

    default:
      throw new TypeError(
        `Unknown fnType "${(<any>data).fnType}" in toPrivateData function`
      );
  }
}
