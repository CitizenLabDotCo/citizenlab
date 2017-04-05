export const expectPropertyNotNull = (nextState, property) => {
  expect(nextState[property]).toBeDefined();
};

export const expectNestedPropertyNotNull = (nextState, property, nestedProperty) => {
  expect(nextState[property][nestedProperty]).toBeDefined();
};

export const randomString = (len, charSet) => {
  const characterSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let str = '';
  for (let i = 0; i < len; i += 1) {
    const randomPos = Math.floor(Math.random() * characterSet.length);
    str += characterSet.substring(randomPos, randomPos + 1);
  }
  return str;
};

export const localStorageMock = () => {
  let store = {};
  return {
    getItem(key) {
      return store[key];
    },
    setItem(key, value) {
      store[key] = value.toString();
    },
    clear() {
      store = {};
    },
  };
};
