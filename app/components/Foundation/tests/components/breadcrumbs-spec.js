import React from 'react';
import { render } from 'enzyme';
import { expect } from 'chai';
import { Breadcrumbs, BreadcrumbItem } from '../../src/components/breadcrumbs';

describe('Breadcrumbs component', () => {

  it('sets tag name', () => {
    const component = render(<Breadcrumbs/>);
    expect(component).to.have.tagName('ul');
  });

  it('sets default class name', () => {
    const component = render(<Breadcrumbs/>);
    expect(component).to.have.className('breadcrumbs');
  });

  it('does not set default class name', () => {
    const component = render(<Breadcrumbs noDefaultClassName/>);
    expect(component).to.not.have.className('breadcrumbs');
  });

  it('sets custom class name', () => {
    const component = render(<Breadcrumbs className="my-breadcrumbs"/>);
    expect(component).to.have.className('my-breadcrumbs');
  });

});

describe('BreadcrumbItem component', () => {

  it('sets tag name', () => {
    const component = render(<BreadcrumbItem/>);
    expect(component).to.have.tagName('li');
  });

  it('sets disabled', () => {
    const component = render(<BreadcrumbItem isDisabled/>);
    expect(component).to.have.className('disabled');
    expect(component).to.not.have.attr('isDisabled');
  });

});
