import React from 'react';
import { render } from 'enzyme';
import { expect } from 'chai';
import { Label } from '../../src/components/label';
import { Colors } from '../../src/enums';

// TODO: Add test cases for invalid enum values

describe('Label component', () => {

  it('sets tag name', () => {
    const component = render(<Label/>);
    expect(component).to.have.tagName('span');
  });

  it('sets default class name', () => {
    const component = render(<Label/>);
    expect(component).to.have.className('label');
  });

  it('does not set default class name', () => {
    const component = render(<Label noDefaultClassName/>);
    expect(component).to.not.have.className('label');
  });

  it('sets custom class name', () => {
    const component = render(<Label className="my-label"/>);
    expect(component).to.have.className('my-label');
  });

  it('sets color', () => {
    const component = render(<Label color={Colors.SUCCESS}/>);
    expect(component).to.have.className('success');
    expect(component).to.not.have.attr('color');
  });

  it('sets contents', () => {
    const component = render(<Label>Build passing</Label>);
    expect(component).to.have.text('Build passing');
  });

});
