import React from 'react';
import { render } from 'enzyme';
import { expect } from 'chai';
import { CloseButton } from '../../src/components/close-button';

describe('CloseButton component', () => {

  it('sets tag name', () => {
    const component = render(<CloseButton/>);
    expect(component).to.have.tagName('button');
  });

  it('sets default class name', () => {
    const component = render(<CloseButton/>);
    expect(component).to.have.className('close-button');
  });

  it('does not set default class name', () => {
    const component = render(<CloseButton noDefaultClassName/>);
    expect(component).to.not.have.className('close-button');
  });

  it('sets custom class name', () => {
    const component = render(<CloseButton className="my-close-button"/>);
    expect(component).to.have.className('my-close-button');
  });

});
