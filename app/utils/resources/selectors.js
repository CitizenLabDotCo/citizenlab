
export const selectResourcesDomain = (...types) => (state) => state.getIn(['resources',...types]);