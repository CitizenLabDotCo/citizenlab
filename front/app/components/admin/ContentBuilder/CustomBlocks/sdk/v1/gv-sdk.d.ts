/**
 * The v1 custom block SDK — the only module a block may import.
 *
 * This file is the single description of the contract. Three consumers read it:
 * the type checker in the custom block sandbox, the system prompt the report
 * generation loop sends to the model, and humans. Keep it in step with
 * `contract.ts` (`sdkContractSync.test.ts` fails when the two disagree) and with
 * the shim at `app/public/custom-block-sdk/v1.js`.
 *
 * The component types are deliberately permissive: the value of typechecking a
 * block is catching mistakes about the platform surface — the shape of query
 * results, hook return values, the props a block itself receives — not
 * re-deriving the prop types of a chart library.
 */
declare module 'gv-sdk' {
  // --- React -------------------------------------------------------------

  export type ReactNode =
    | string
    | number
    | boolean
    | null
    | undefined
    | ReactNode[]
    | { type: unknown; props: unknown; key: unknown };

  export interface ComponentLike {
    (props: Record<string, unknown>): ReactNode;
  }

  export const React: {
    createElement: (...args: unknown[]) => ReactNode;
    Fragment: unknown;
    useState: <S>(
      initial: S | (() => S)
    ) => [S, (next: S | ((prev: S) => S)) => void];
    useMemo: <T>(factory: () => T, deps: readonly unknown[]) => T;
    useCallback: <T extends (...args: never[]) => unknown>(
      fn: T,
      deps: readonly unknown[]
    ) => T;
    useEffect: (
      effect: () => void | (() => void),
      deps?: readonly unknown[]
    ) => void;
    useRef: <T>(initial: T) => { current: T };
  };

  export const jsx: (...args: unknown[]) => ReactNode;
  export const jsxs: (...args: unknown[]) => ReactNode;
  export const Fragment: unknown;

  // --- The block contract ------------------------------------------------

  /**
   * What a block's default export receives.
   *
   * `config` holds the per-instance values an admin set in the builder sidebar,
   * described by `manifest.config_schema`. `msg` reads the block's own message
   * catalogue for the reader's locale — every visible string goes through it.
   */
  export interface BlockProps<Config = Record<string, unknown>> {
    config: Config;
    msg: (key: string) => string;
  }

  // --- Component library subset -----------------------------------------

  export const Box: ComponentLike;
  export const Text: ComponentLike;
  export const Title: ComponentLike;
  export const Button: ComponentLike;
  export const Icon: ComponentLike;
  export const Spinner: ComponentLike;

  /** The platform's design tokens. Use these, never a literal hex value. */
  export const colors: Record<string, string>;

  // --- Routing -----------------------------------------------------------

  export const Link: ComponentLike;

  // --- Platform hooks ----------------------------------------------------

  export type SupportedLocale = string;

  /** A field with one value per locale, e.g. `{ en: 'Budget', nl: 'Budget' }`. */
  export type Multiloc = Record<string, string>;

  export const useLocale: () => SupportedLocale;

  /** Picks the reader's locale out of a multiloc field, with a sensible fallback. */
  export const useLocalize: () => (
    multiloc: Multiloc | null | undefined
  ) => string;

  export const useTheme: () => {
    colors: Record<string, string>;
    fontSizes: Record<string, number>;
  };

  export const useAppConfiguration: () => {
    data?: {
      attributes: {
        name: string;
        settings: Record<string, unknown>;
      };
    };
  };

  export const useAuthUser: () => {
    data?: {
      id: string;
      attributes: { first_name: string | null; locale: string };
    };
  };

  export const useProjectsMini: (params?: Record<string, unknown>) => {
    data?: { data: { id: string; attributes: { title_multiloc: Multiloc } }[] };
  };

  // --- Reporting data ----------------------------------------------------

  /** One row of a query result: column name to value. */
  export type ReportingRow = Record<string, string | number | boolean | null>;

  export interface ReportingData {
    columns: string[];
    rows: ReportingRow[];
    /** True when the query hit the 1000-row cap and the result is incomplete. */
    truncated: boolean;
  }

  /**
   * Runs one read-only query over the platform's reporting views.
   *
   * The SQL must be a static string — a plain string or a template literal with
   * no `${}` substitutions — because it is extracted from the source at build
   * time and snapshotted. Aggregate in SQL; at most 1000 rows come back.
   */
  export const useReportingData: (sql: string) => {
    data: ReportingData | undefined;
    isLoading: boolean;
    error: unknown;
  };

  // --- Charts (recharts) -------------------------------------------------

  export const ResponsiveContainer: ComponentLike;
  export const BarChart: ComponentLike;
  export const Bar: ComponentLike;
  export const LineChart: ComponentLike;
  export const Line: ComponentLike;
  export const AreaChart: ComponentLike;
  export const Area: ComponentLike;
  export const PieChart: ComponentLike;
  export const Pie: ComponentLike;
  export const Cell: ComponentLike;
  export const XAxis: ComponentLike;
  export const YAxis: ComponentLike;
  export const CartesianGrid: ComponentLike;
  export const Tooltip: ComponentLike;
  export const Legend: ComponentLike;
  export const LabelList: ComponentLike;
}
