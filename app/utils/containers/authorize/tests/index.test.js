import React from 'react';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';
import { render } from 'enzyme';
import configureMockStore from 'redux-mock-store';

import Authorize, { Else } from '../index';

describe('<Authorize />', () => {
  it('renders its children when the action is authorized', () => {
    const fakeStore = fromJS({
      resources: {
        users: {
          abc: {
            attributes: {
            },
          },
        },
      },
      auth: { id: 'abc' },
    });

    const component = render(
      <Provider store={configureMockStore([])(fakeStore)}>
        <Authorize action={['comments', 'create']}>
          <div>works</div>
        </Authorize>
      </Provider>
    );
    expect(component.text()).toEqual('works');
  });

  it('it can pass a given resource to the authorizations', () => {
    const fakeStore = fromJS({ resources: {}, auth: {} });
    const storeResource = fromJS({ relationships: { author: { data: { id: 'abc' } } } });

    const authorizations = {
      comments: {
        delete: (user, resource) => resource === storeResource,
      },
    };
    const component = render(
      <Provider store={configureMockStore([])(fakeStore)}>
        <Authorize action={['comments', 'delete']} resource={storeResource}>
          <div>works</div>
          <Else>
            <div>does not</div>
          </Else>
        </Authorize>
      </Provider>
    );
    expect(component.text()).toEqual('works');
  });

  it('renders its Else when action is not authorized', () => {
    const fakeStore = fromJS({
      resources: {
        users: {
          1234: {
            attributes: {
            },
          },
        },
      },
      auth: { id: 'abc' },
    });

    const component = render(
      <Provider store={configureMockStore([])(fakeStore)}>
        <Authorize action={['comments', 'create']}>
          <div>works</div>
          <Else>
            <div>does not</div>
          </Else>
        </Authorize>
      </Provider>
    );
    expect(component.text()).toEqual('does not');
  });
});
