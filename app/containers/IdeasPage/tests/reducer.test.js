
import { fromJS } from 'immutable';
import ideasPageReducer from '../reducer';

const initialState = fromJS({
  ideas: [
    { heading: 'Eureka', description: 'I like to...' },
  ],
});

describe('ideasPageReducer', () => {
  it('returns the initial state', () => {
    expect(ideasPageReducer(undefined, {})).toEqual(initialState);
  });
});
