import React from 'react';
import { render } from 'enzyme';
import { expect } from 'chai';
import { Icon } from '../../src/components/icon';

describe('Icon component', () => {

  it('sets tag name', () => {
    const component = render(<Icon name="ok"/>);
    expect(component).to.have.tagName('i');
  });

  it('sets icon', () => {
    const component = render(<Icon name="ok"/>);
    expect(component).to.have.className('ok');
    expect(component).to.not.have.attr('icon');
  });

  it('sets prefix', () => {
    const component = render(<Icon prefix="fa" name="ok"/>);
    expect(component).to.have.className('fa');
    expect(component).to.not.have.attr('prefix');
  });

  it('adds prefix to name', () => {
    const component = render(<Icon prefix="fa" name="ok"/>);
    expect(component).to.have.className('fa');
    expect(component).to.have.className('fa-ok');
  });

});
