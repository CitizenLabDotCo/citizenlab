// @ts-nocheck
import React from 'react';
import { shallow } from 'enzyme';

import { FeedbackToggle } from './FeedbackToggle';

jest.mock('services/stats');
jest.mock('utils/cl-intl');

// mocking dependencies
jest.mock('resources/GetIdeasCount', () => 'GetIdeasCount');
jest.mock('resources/GetInitiativesCount', () => 'GetInitiativesCount');
jest.mock('components/UI/CountBadge', () => 'CountBadge');
jest.mock('utils/cl-intl');
jest.mock('modules', () => ({ streamsToReset: [] }));

import 'jest-styled-components';

describe('<FeedbackToggle />', () => {
  let onChange: jest.Mock;
  beforeEach(() => {
    onChange = jest.fn();
  });

  it('renders correctly unchecked for ideas', () => {
    const ideasCount = { count: 6 };

    const wrapper = shallow(
      <FeedbackToggle
        type="AllIdeas"
        assignee="me"
        feedbackNeededCount={ideasCount}
        value={false}
        onChange={onChange}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correctly checked for initiatives', () => {
    const initiativesCount = { count: 6 };

    const wrapper = shallow(
      <FeedbackToggle
        type="Initiatives"
        assignee="me"
        feedbackNeededCount={initiativesCount}
        value={true}
        onChange={onChange}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('has coherent aria checked attibutes', () => {
    const ideasCount = { count: 6 };

    const wrapper = shallow(
      <FeedbackToggle
        type="AllIdeas"
        assignee="me"
        feedbackNeededCount={ideasCount}
        value={true}
        onChange={onChange}
      />
    );
    const Toggle = wrapper.find('FeedbackToggle__ToggleContainer');
    expect(Toggle.props().checked).toBeTruthy;
    const Input = wrapper.find('input');
    expect(Input.props()['aria-checked']).toBeTruthy;
  });

  it('calls onChange when clicked', () => {
    const ideasCount = { count: 6 };

    const wrapper = shallow(
      <FeedbackToggle
        type="Initiatives"
        assignee="me"
        feedbackNeededCount={ideasCount}
        value={false}
        onChange={onChange}
      />
    );
    wrapper
      .find('FeedbackToggle__ToggleContainer')
      .simulate('click', { preventDefault() {}, stopPropagation() {} });

    expect(onChange).toHaveBeenCalled();
  });

  it('reacts to search change', () => {
    const onChangeSearchTerm = jest.fn();
    const ideasCount = {
      onChangeSearchTerm,
      count: 6,
    };

    const wrapper = shallow(
      <FeedbackToggle
        assignee="me"
        feedbackNeededCount={ideasCount}
        value={false}
        onChange={onChange}
      />
    );
    wrapper.setProps({ searchTerm: 'lalalalalala' });

    expect(onChangeSearchTerm).toHaveBeenCalledWith('lalalalalala');
  });
});
