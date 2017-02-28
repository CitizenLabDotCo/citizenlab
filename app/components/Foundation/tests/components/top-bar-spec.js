import React from 'react';
import { render } from 'enzyme';
import { expect } from 'chai';
import { TopBar, TopBarTitle, TopBarLeft, TopBarRight } from '../../src/components/top-bar';

describe('TopBar component', () => {

  it('sets tag name', () => {
    const component = render(<TopBar/>);
    expect(component).to.have.tagName('div');
  });

  it('sets default class name', () => {
    const component = render(<TopBar/>);
    expect(component).to.have.className('top-bar');
  });

  it('does not set default class name', () => {
    const component = render(<TopBar noDefaultClassName/>);
    expect(component).to.not.have.className('top-bar');
  });

  it('sets custom class name', () => {
    const component = render(<TopBar className="my-top-bar"/>);
    expect(component).to.have.className('my-top-bar');
  });

});

describe('TopBarTitle component', () => {

  it('sets tag name', () => {
    const component = render(<TopBarTitle/>);
    expect(component).to.have.tagName('div');
  });

  it('sets default class name', () => {
    const component = render(<TopBarTitle/>);
    expect(component).to.have.className('top-bar-title');
  });

  it('does not set default class name', () => {
    const component = render(<TopBarTitle noDefaultClassName/>);
    expect(component).to.not.have.className('top-bar-title');
  });

  it('sets custom class name', () => {
    const component = render(<TopBarTitle className="my-top-bar-title"/>);
    expect(component).to.have.className('my-top-bar-title');
  });

});

describe('TopBarLeft component', () => {

  it('sets tag name', () => {
    const component = render(<TopBarLeft/>);
    expect(component).to.have.tagName('div');
  });

  it('sets default class name', () => {
    const component = render(<TopBarLeft/>);
    expect(component).to.have.className('top-bar-left');
  });

  it('does not set default class name', () => {
    const component = render(<TopBarLeft noDefaultClassName/>);
    expect(component).to.not.have.className('top-bar-left');
  });

  it('sets custom class name', () => {
    const component = render(<TopBarLeft className="my-top-bar-left"/>);
    expect(component).to.have.className('my-top-bar-left');
  });

});

describe('TopBarRight component', () => {

  it('sets tag name', () => {
    const component = render(<TopBarRight/>);
    expect(component).to.have.tagName('div');
  });

  it('sets default class name', () => {
    const component = render(<TopBarRight/>);
    expect(component).to.have.className('top-bar-right');
  });

  it('does not set default class name', () => {
    const component = render(<TopBarRight noDefaultClassName/>);
    expect(component).to.not.have.className('top-bar-right');
  });

  it('sets custom class name', () => {
    const component = render(<TopBarRight className="my-top-bar-right"/>);
    expect(component).to.have.className('my-top-bar-right');
  });

});
