import React from 'react';
import { render } from 'enzyme';
import { expect } from 'chai';
import { ButtonGroup, ButtonGroupSizes, ButtonGroupColors } from '../../src/components/button-group';
import { Breakpoints, Colors, Sizes } from '../../src/enums';

// TODO: Add test cases for invalid enum values

describe('ButtonGroup component', () => {

  it('sets tag name', () => {
    const component = render(<ButtonGroup/>);
    expect(component).to.have.tagName('div');
  });

  it('sets default class name', () => {
    const component = render(<ButtonGroup/>);
    expect(component).to.have.className('button-group');
  });

  it('does not set default class name', () => {
    const component = render(<ButtonGroup noDefaultClassName/>);
    expect(component).to.not.have.className('button-group');
  });

  it('sets custom class name', () => {
    const component = render(<ButtonGroup className="my-button-group"/>);
    expect(component).to.have.className('my-button-group');
  });

  it('sets size', () => {
    const component = render(<ButtonGroup size={Sizes.SMALL}/>);
    expect(component).to.have.className('small');
    expect(component).to.not.have.attr('size');
  });

  it('sets color', () => {
    const component = render(<ButtonGroup color={Colors.SUCCESS}/>);
    expect(component).to.have.className('success');
    expect(component).to.not.have.attr('color');
  });

  it('sets expanded', () => {
    const component = render(<ButtonGroup isExpanded/>);
    expect(component).to.have.className('expanded');
    expect(component).to.not.have.attr('isExpanded');
  });

  it('sets stacked', () => {
    const component = render(<ButtonGroup isStacked/>);
    expect(component).to.have.className('stacked');
    expect(component).to.not.have.attr('isStacked');
  });

  it('sets stack on small', () => {
    const component = render(<ButtonGroup stackFor={Breakpoints.SMALL}/>);
    expect(component).to.have.className('stacked-for-small');
    expect(component).to.not.have.attr('stackedForSmall');
  });

  it('sets stack on medium', () => {
    const component = render(<ButtonGroup stackFor={Breakpoints.MEDIUM}/>);
    expect(component).to.have.className('stacked-for-medium');
    expect(component).to.not.have.attr('stackedForMedium');
  });

  it('sets stack on large', () => {
    const component = render(<ButtonGroup stackFor={Breakpoints.LARGE}/>);
    expect(component).to.have.className('stacked-for-large');
    expect(component).to.not.have.attr('stackedForLarge');
  });

});
