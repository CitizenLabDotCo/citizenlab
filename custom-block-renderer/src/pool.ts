import { chromium, type Browser, type BrowserContext } from "playwright";

import { withDeadline } from "./deadline.ts";

const POOL_SIZE = Number(process.env.RENDER_POOL_SIZE ?? 3);

/** A context is thrown away after this many renders, so generated code cannot accumulate. */
const RENDERS_PER_CONTEXT = 50;

/**
 * A render gives its slot back within about 75 seconds, its deadlines included. A slot
 * out for longer than this is held by something no deadline covers.
 */
const STUCK_AFTER_MS = 120_000;

/**
 * Closing a context kills its pages, even one stuck in a loop. Should the close
 * itself hang, the slot gets a new context anyway.
 */
const CONTEXT_CLOSE_TIMEOUT_MS = 5_000;

/** The A4 content width reports are laid out for; charts size themselves to it. */
const VIEWPORT = { width: 794, height: 1123 };

/**
 * WebRTC opens connections that page.route and routeWebSocket never see: a block
 * could hand a TURN server of its choosing the rows it read, past every check in
 * egress.ts. Nothing a block renders needs it, so it is taken out of every
 * document before the document's own scripts run.
 */
const WEBRTC_GLOBALS = [
  "RTCPeerConnection",
  "webkitRTCPeerConnection",
  "RTCDataChannel",
  "RTCIceTransport",
  "RTCSctpTransport",
];

const removeWebRtc = (names: string[]): void => {
  for (const name of names) {
    // Not just deleted: a non-writable, non-configurable undefined cannot be put
    // back by the page.
    Object.defineProperty(globalThis, name, {
      value: undefined,
      writable: false,
      configurable: false,
    });
  }
};

interface Slot {
  context: BrowserContext;
  uses: number;
}

/** The part of the server's logger the pool uses, so the pool does not depend on Fastify. */
export interface PoolLogger {
  warn(details: object, message: string): void;
}

/** Whether a render could still get a slot: one is free, or one is out but not stuck. */
export const canStillRender = (
  freeSlots: number,
  checkedOutAt: Iterable<number>,
  now: number
): boolean =>
  freeSlots > 0 || [...checkedOutAt].some((at) => now - at < STUCK_AFTER_MS);

/**
 * A small pool of warm browser contexts.
 *
 * Starting Chromium per render would cost seconds; sharing one context across
 * renders would let one block's storage and timers reach the next. A context per
 * slot, recycled after a while, buys the warm start without the leak.
 */
export class RenderPool {
  private browser: Browser | null = null;
  private slots: Slot[] = [];
  private waiting: ((slot: Slot) => void)[] = [];
  private checkedOut = new Map<Slot, number>();
  private readonly log: PoolLogger;

  constructor(log: PoolLogger) {
    this.log = log;
  }

  async start(): Promise<void> {
    this.browser = await chromium.launch({
      args: [
        // This process runs model-generated JavaScript.
        "--no-sandbox",
        "--disable-dev-shm-usage",
        // No pop-ups; what a page may fetch is decided per request in render.ts.
        "--block-new-web-contents",
        // In production the tenant's host resolves on its own. In development the
        // tenant is `localhost`, which inside this container is this container — so
        // the host it really lives on has to be spelled out.
        ...(process.env.RENDER_HOST_RESOLVER_RULES
          ? [`--host-resolver-rules=${process.env.RENDER_HOST_RESOLVER_RULES}`]
          : []),
      ],
    });

    this.slots = await Promise.all(
      Array.from({ length: POOL_SIZE }, () => this.newSlot())
    );
  }

  async stop(): Promise<void> {
    await Promise.all(this.slots.map((slot) => slot.context.close()));
    this.slots = [];
    await this.browser?.close();
    this.browser = null;
  }

  get ready(): boolean {
    return this.browser !== null;
  }

  /**
   * False once no render can succeed until the process is replaced: Chromium is gone,
   * or every slot is held by a render that never gave it back. A pool that never
   * started counts as healthy, because building does not need it.
   */
  get healthy(): boolean {
    if (!this.browser) return true;

    return (
      this.browser.isConnected() &&
      canStillRender(this.slots.length, this.checkedOut.values(), Date.now())
    );
  }

  /** Resolves with a context to render in, once one is free. */
  acquire(): Promise<Slot> {
    const free = this.slots.pop();
    if (free) {
      this.checkedOut.set(free, Date.now());
      return Promise.resolve(free);
    }

    return new Promise((resolve) => this.waiting.push(resolve));
  }

  /** `discard` replaces the slot's context, for one whose page may still be running code. */
  async release(slot: Slot, { discard = false } = {}): Promise<void> {
    slot.uses += 1;

    const usable =
      discard || slot.uses >= RENDERS_PER_CONTEXT
        ? await this.recycle(slot)
        : slot;
    // Only now: a slot whose context is being replaced is still on its way back, and
    // counting it as gone would fail the health check of a pool that is fine.
    this.checkedOut.delete(slot);
    if (!usable) return;

    const next = this.waiting.shift();
    if (next) {
      this.checkedOut.set(usable, Date.now());
      next(usable);
      return;
    }
    this.slots.push(usable);
  }

  /** Null when no new context could be made: the pool is a slot short from then on. */
  private async recycle(slot: Slot): Promise<Slot | null> {
    await withDeadline(
      slot.context.close(),
      CONTEXT_CLOSE_TIMEOUT_MS,
      "The context did not close."
    ).catch((error: unknown) => {
      this.log.warn(
        { err: error },
        "A browser context did not close; a page in it may still be running code."
      );
    });
    return this.newSlot().catch((error: unknown) => {
      this.log.warn(
        { err: error },
        "A browser context could not be replaced; the render pool is a slot short from now on."
      );
      return null;
    });
  }

  private async newSlot(): Promise<Slot> {
    if (!this.browser) throw new Error("The render pool is not started.");

    const context = await this.browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: 2,
      // A report is printed on white paper. Checking it in whatever scheme the
      // container happens to default to would judge colours the reader never sees.
      colorScheme: "light",
      forcedColors: "none",
      // Nothing is signed in here; the block's only credential is the scoped token
      // the harness injects per run.
      storageState: undefined,
      // A service worker's own requests do not pass page.route, so egress.ts would
      // not see them. Blocked, register() still resolves but the worker never
      // starts. The harness does not need one.
      serviceWorkers: "block",
    });
    // Runs in every frame of every page in this context, ahead of the page's own
    // scripts, so neither the harness nor a frame a block creates has WebRTC.
    await context.addInitScript(removeWebRtc, WEBRTC_GLOBALS);
    return { context, uses: 0 };
  }
}
