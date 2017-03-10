export const loadState = () => {
  try {
    const serializedState = window.localStorage.getItem('app_state');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

export const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    window.localStorage.setItem('app_state', serializedState);
  } catch (err) {
    console.log(err); // eslint-disable-line
  }
};

