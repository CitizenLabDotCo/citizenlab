import React from 'react';
import { render } from 'enzyme';
import { expect } from 'chai';
import { Block, Inline } from '../../src/components/element';

describe('Block component', () => {

  it('sets tag name', () => {
    const component = render(<Block/>);
    expect(component).to.have.tagName('div');
  });

  it('sets default class name', () => {
    const component = render(<Block className="block"/>);
    expect(component).to.have.className('block');
  });

  it('sets hidden', () => {
    const component = render(<Block isHidden/>);
    expect(component).to.have.className('hide');
    expect(component).to.not.have.attr('isHidden');
  });

  it('sets contents', () => {
    const component = render(<Block>1</Block>);
    expect(component).to.have.text('1');
  });

});

describe('Inline component', () => {

  it('sets tag name', () => {
    const component = render(<Inline/>);
    expect(component).to.have.tagName('span');
  });

  it('sets default class name', () => {
    const component = render(<Inline className="inline"/>);
    expect(component).to.have.className('inline');
  });

  it('sets hidden', () => {
    const component = render(<Inline showForSr/>);
    expect(component).to.have.className('show-for-sr');
    expect(component).to.not.have.attr('showForSr');
  });

  it('sets contents', () => {
    const component = render(<Inline>A</Inline>);
    expect(component).to.have.text('A');
  });

});
