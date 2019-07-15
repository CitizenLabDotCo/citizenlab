import React from 'react';
import { shallow } from 'enzyme';

import { FeedbackToggle } from './FeedbackToggle';
import { makeIdeasCount } from 'services/stats';

jest.mock('services/stats');
jest.mock('utils/cl-intl');

import 'jest-styled-components';

describe('<FeedbackToggle />', () => {
  let onChange: jest.Mock;
  beforeEach(() => {
    onChange = jest.fn();
  });

  it('renders correctly unchecked for ideas', () => {
    const ideasCount = makeIdeasCount(6);

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
    const ideasCount = makeIdeasCount(6); // same as initiatives, so it will do

    const wrapper = shallow(
      <FeedbackToggle
        type="Initiatives"
        assignee="me"
        feedbackNeededCount={ideasCount}
        value={true}
        onChange={onChange}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('has coherent aria checked attibutes', () => {
    const ideasCount = makeIdeasCount(6);

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
    const ideasCount = makeIdeasCount(6);

    const wrapper = shallow(
      <FeedbackToggle
        assignee="me"
        feedbackNeededCount={ideasCount}
        value={false}
        onChange={onChange}
      />
    );
    wrapper.find('FeedbackToggle__ToggleContainer').simulate('click', { preventDefault() { }, stopPropagation() { } });

    expect(onChange).toHaveBeenCalled();
  });
});
