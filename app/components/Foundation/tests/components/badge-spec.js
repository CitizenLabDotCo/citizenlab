import React from 'react';
import { render } from 'enzyme';
import { expect } from 'chai';
import { Badge } from '../../src/components/badge';
import { Colors } from '../../src/enums';

// TODO: Add test cases for invalid enum values

describe('Badge component', () => {

  it('sets tag name', () => {
    const component = render(<Badge/>);
    expect(component).to.have.tagName('span');
  });

  it('sets default class name', () => {
    const component = render(<Badge/>);
    expect(component).to.have.className('badge');
  });

  it('does not set default class name', () => {
    const component = render(<Badge noDefaultClassName/>);
    expect(component).to.not.have.className('badge');
  });

  it('sets custom class name', () => {
    const component = render(<Badge className="my-badge"/>);
    expect(component).to.have.className('my-badge');
  });

  it('sets color', () => {
    const component = render(<Badge color={Colors.SUCCESS}/>);
    expect(component).to.have.className('success');
    expect(component).to.not.have.attr('color');
  });

  it('sets contents', () => {
    const component = render(<Badge>1</Badge>);
    expect(component).to.have.text('1');
  });

});
