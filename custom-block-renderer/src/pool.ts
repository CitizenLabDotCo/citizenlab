import { chromium, type Browser, type BrowserContext } from "playwright";

const POOL_SIZE = Number(process.env.RENDER_POOL_SIZE ?? 3);

/** A context is thrown away after this many renders, so generated code cannot accumulate. */
const RENDERS_PER_CONTEXT = 50;

/** The A4 content width reports are laid out for; charts size themselves to it. */
const VIEWPORT = { width: 794, height: 1123 };

interface Slot {
  context: BrowserContext;
  uses: number;
}

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

  /** Resolves with a context to render in, once one is free. */
  acquire(): Promise<Slot> {
    const free = this.slots.pop();
    if (free) return Promise.resolve(free);

    return new Promise((resolve) => this.waiting.push(resolve));
  }

  async release(slot: Slot): Promise<void> {
    const usable =
      slot.uses + 1 < RENDERS_PER_CONTEXT ? slot : await this.recycle(slot);
    usable.uses = usable === slot ? slot.uses + 1 : 0;

    const next = this.waiting.shift();
    if (next) {
      next(usable);
      return;
    }
    this.slots.push(usable);
  }

  private async recycle(slot: Slot): Promise<Slot> {
    await slot.context.close().catch(() => undefined);
    return this.newSlot();
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
    });
    return { context, uses: 0 };
  }
}
