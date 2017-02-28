import React from 'react';
import { mount, render } from 'enzyme';
import { createRenderer } from 'react-addons-test-utils';
import { expect } from 'chai';
import { Switch, SwitchInput, SwitchPaddle, SwitchActive, SwitchInactive } from '../../src/components/switch';
import { InputTypes } from '../../src/enums';

// TODO: Add test cases for input types

describe('Switch component', () => {

  it('sets tag name', () => {
    const component = render(<Switch/>);
    expect(component).to.have.tagName('div');
  });

  it('sets default class name', () => {
    const component = render(<Switch/>);
    expect(component).to.have.className('switch');
  });

  it('does not set default class name', () => {
    const component = render(<Switch noDefaultClassName/>);
    expect(component).to.not.have.className('switch');
  });

  it('sets custom class name', () => {
    const component = render(<Switch className="my-switch"/>);
    expect(component).to.have.className('my-switch');
  });

  it('has correct children', () => {
    const renderer = createRenderer();
    renderer.render(<Switch id="foo"/>);
    const output = renderer.getRenderOutput();
    expect(output).jsx.to.equal(<div className="switch"><SwitchInput id="foo"/><SwitchPaddle htmlFor="foo"/></div>);
  });

  it('passes on props', () => {
    const component = mount(<Switch input={{ value: 'foo' }} paddle={{ id: 'bar' }}/>);
    expect(component.find('.switch-input')).to.have.value('foo');
    expect(component.find('.switch-paddle')).to.have.attr('id', 'bar');
  });

  it('renders active label', () => {
    const component = mount(<Switch active={{ text: 'On' }}/>);
    expect(component.find('.switch-active')).to.have.text('On');
  });

  it('renders inactive label', () => {
    const component = mount(<Switch inactive={{ text: 'Off' }}/>);
    expect(component.find('.switch-inactive')).to.have.text('Off');
  });

});

describe('SwitchInput component', () => {

  it('sets tag name', () => {
    const component = render(<SwitchInput/>);
    expect(component).to.have.tagName('input');
  });

  it('sets default class name', () => {
    const component = render(<SwitchInput/>);
    expect(component).to.have.className('switch-input');
  });

  it('does not set default class name', () => {
    const component = render(<SwitchInput noDefaultClassName/>);
    expect(component).to.not.have.className('switch-input');
  });

  it('sets custom class name', () => {
    const component = render(<SwitchInput className="my-switch-input"/>);
    expect(component).to.have.className('my-switch-input');
  });

});

describe('SwitchPaddle component', () => {

  it('sets tag name', () => {
    const component = render(<SwitchPaddle/>);
    expect(component).to.have.tagName('label');
  });

  it('sets default class name', () => {
    const component = render(<SwitchPaddle/>);
    expect(component).to.have.className('switch-paddle');
  });

  it('does not set default class name', () => {
    const component = render(<SwitchPaddle noDefaultClassName/>);
    expect(component).to.not.have.className('switch-paddle');
  });

  it('sets custom class name', () => {
    const component = render(<SwitchPaddle className="my-switch-paddle"/>);
    expect(component).to.have.className('my-switch-paddle');
  });

});

describe('SwitchActive component', () => {

  it('sets tag name', () => {
    const component = render(<SwitchActive/>);
    expect(component).to.have.tagName('span');
  });

  it('sets default class name', () => {
    const component = render(<SwitchActive/>);
    expect(component).to.have.className('switch-active');
  });

  it('does not set default class name', () => {
    const component = render(<SwitchActive noDefaultClassName/>);
    expect(component).to.not.have.className('switch-active');
  });

  it('sets custom class name', () => {
    const component = render(<SwitchActive className="my-switch-active"/>);
    expect(component).to.have.className('my-switch-active');
  });

  it('sets aria-hidden', () => {
    const component = render(<SwitchActive/>);
    expect(component).to.have.attr('aria-hidden');
  });

  it('sets contents', () => {
    const component = render(<SwitchActive text="On"/>);
    expect(component).to.have.text('On');
    expect(component).to.not.have.attr('text');
  });

});

describe('SwitchInactive component', () => {

  it('sets tag name', () => {
    const component = render(<SwitchInactive/>);
    expect(component).to.have.tagName('span');
  });

  it('sets default class name', () => {
    const component = render(<SwitchInactive/>);
    expect(component).to.have.className('switch-inactive');
  });

  it('does not set default class name', () => {
    const component = render(<SwitchInactive noDefaultClassName/>);
    expect(component).to.not.have.className('switch-inactive');
  });

  it('sets custom class name', () => {
    const component = render(<SwitchInactive className="my-switch-inactive"/>);
    expect(component).to.have.className('my-switch-inactive');
  });

  it('sets aria-hidden', () => {
    const component = render(<SwitchInactive/>);
    expect(component).to.have.attr('aria-hidden');
  });

  it('sets contents', () => {
    const component = render(<SwitchInactive text="Off"/>);
    expect(component).to.have.text('Off');
    expect(component).to.not.have.attr('text');
  });

});
