class PreviewStorage implements Storage {
  private values = new Map<string, string>();

  constructor(source: Storage) {
    for (let index = 0; index < source.length; index++) {
      const key = source.key(index);
      if (key !== null) {
        const value = source.getItem(key);
        if (value !== null) this.values.set(key, value);
      }
    }
  }

  get length() {
    return this.values.size;
  }
  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.values.set(key, String(value));
  }
  removeItem(key: string) {
    this.values.delete(key);
  }
  clear() {
    this.values.clear();
  }
}

export const isolatePreviewStorage = () => {
  for (const name of ['localStorage', 'sessionStorage'] as const) {
    Object.defineProperty(window, name, {
      configurable: true,
      value: new PreviewStorage(window[name]),
    });
  }

  // Reading the existing login still authorizes GET requests. Cookie writes in
  // the preview must not sign out or change preferences in the parent editor.
  const cookie = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
  if (cookie?.get) {
    Object.defineProperty(document, 'cookie', {
      configurable: true,
      get: () => cookie.get?.call(document),
      set: () => undefined,
    });
  }
};
