declare global {
  interface Window {
    analytics: {
      identify: (
        userIdOrTraits: string | object, // Allow string or object
        traits?: object,
        options?: object
      ) => void;
      group: (groupId: string, traits: object, options?: object) => void;
      track: (event: string, properties?: object, options?: object) => void;
      page: (name?: string, properties?: object, options?: object) => void;
    };
  }

  const analytics: {
    identify: (
      userIdOrTraits: string | object,
      traits?: object,
      options?: object
    ) => void;
    group: (groupId: string, traits: object, options?: object) => void;
    track: (event: string, properties?: object, options?: object) => void;
    page: (name?: string, properties?: object, options?: object) => void;
  };
}

export {};
