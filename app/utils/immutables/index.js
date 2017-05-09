export const getFromState = (state, property, subProperty) => {
  if (subProperty) {
    return state.getIn([property, subProperty]);
  }
  return state.get(property);
};
