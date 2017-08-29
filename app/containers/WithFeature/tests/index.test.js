import React from 'react';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';
import { render } from 'enzyme';
import configureMockStore from 'redux-mock-store';


import WithFeature, { Without } from '../index';

describe('<WithFeature />', () => {
  const fakeStore = fromJS({
    resources: {
      tenants: {
        abc: {
          attributes: {
            settings: {
              comments: {
                enabled: true,
                allowed: true,
              },
            },
          },
        },
      },
    },
    tenant: { id: 'abc' },
  });

  it('renders its children when feature is enabled and allowed', () => {
    const component = render(
      <Provider store={configureMockStore([])(fakeStore)}>
        <WithFeature feature="comments">
          <div>works</div>
        </WithFeature>
      </Provider>
    );
    expect(component.text()).toEqual('works');
  });
  it('renders its Without when feature is disabled', () => {
    const store = fakeStore.setIn(['resources', 'tenants', 'abc', 'attributes', 'settings', 'comments', 'enabled'], false);
    const component = render(
      <Provider store={configureMockStore([])(store)}>
        <WithFeature feature="comments">
          <div>works</div>
          <Without>
            <div>does not</div>
          </Without>
        </WithFeature>
      </Provider>
    );
    expect(component.text()).toEqual('does not');
  });
  it('renders its Without when feature is not allowed', () => {
    const store = fakeStore.setIn(['resources', 'tenants', 'abc', 'attributes', 'settings', 'comments', 'enabled'], false);
    const component = render(
      <Provider store={configureMockStore([])(store)}>
        <WithFeature feature="comments">
          <div>works</div>
          <Without>
            <div>does not</div>
          </Without>
        </WithFeature>
      </Provider>
    );
    expect(component.text()).toEqual('does not');
  });
});
