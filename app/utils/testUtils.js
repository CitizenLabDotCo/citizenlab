export const expectPropertyNotNull = (nextState, property) => {
  expect(nextState[property]).toBeDefined();
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
