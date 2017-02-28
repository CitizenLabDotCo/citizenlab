import React from 'react';
import { render } from 'enzyme';
import { expect } from 'chai';
import { Callout, CalloutColors, CalloutSizes } from '../../src/components/callout';
import { Colors, Sizes } from '../../src/enums';

// TODO: Add test cases for invalid enum values

describe('Callout component', () => {

  it('sets tag name', () => {
    const component = render(<Callout/>);
    expect(component).to.have.tagName('div');
  });

  it('sets default class name', () => {
    const component = render(<Callout/>);
    expect(component).to.have.className('callout');
  });

  it('does not set default class name', () => {
    const component = render(<Callout noDefaultClassName/>);
    expect(component).to.not.have.className('callout');
  });

  it('sets custom class name', () => {
    const component = render(<Callout className="my-callout"/>);
    expect(component).to.have.className('my-callout');
  });

  it('sets color', () => {
    const component = render(<Callout color={Colors.SUCCESS}/>);
    expect(component).to.have.className('success');
    expect(component).to.not.have.attr('color');
  });

  it('sets size', () => {
    const component = render(<Callout size={Sizes.SMALL}/>);
    expect(component).to.have.className('small');
    expect(component).to.not.have.attr('size');
  });

  it('sets contents', () => {
    const component = render(<Callout>Hello</Callout>);
    expect(component).to.have.text('Hello');
  });

});
