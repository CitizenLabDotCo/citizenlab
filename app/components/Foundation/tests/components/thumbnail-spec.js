import React from 'react';
import { mount, render } from 'enzyme';
import { expect } from 'chai';
import { Thumbnail, ThumbnailLink } from '../../src/components/thumbnail';

describe('Thumbnail component', () => {

  it('sets tag name', () => {
    const component = render(<Thumbnail/>);
    expect(component).to.have.tagName('img');
  });

  it('sets default class name', () => {
    const component = render(<Thumbnail/>);
    expect(component).to.have.className('thumbnail');
  });

  it('does not set default class name', () => {
    const component = render(<Thumbnail noDefaultClassName/>);
    expect(component).to.not.have.className('thumbnail');
  });

  it('sets custom class name', () => {
    const component = render(<Thumbnail className="my-thumbnail"/>);
    expect(component).to.have.className('my-thumbnail');
  });

  it('sets source url', () => {
    const component = render(<Thumbnail src="assets/img/thumbnail/01.jpg"/>);
    expect(component).to.have.attr('src', 'assets/img/thumbnail/01.jpg');
  });

  it('sets alternative text', () => {
    const component = render(<Thumbnail alt="Photo of Uranus."/>);
    expect(component).to.have.attr('alt', 'Photo of Uranus.');
  });

});

describe('ThumbnailLink component', () => {

  it('sets tag name', () => {
    const component = render(<ThumbnailLink/>);
    expect(component).to.have.tagName('a');
  });

  it('sets default class name', () => {
    const component = render(<ThumbnailLink/>);
    expect(component).to.have.className('thumbnail');
  });

  it('does not set default class name', () => {
    const component = render(<ThumbnailLink noDefaultClassName/>);
    expect(component).to.not.have.className('thumbnail');
  });

  it('sets custom class name', () => {
    const component = render(<ThumbnailLink className="my-thumbnail"/>);
    expect(component).to.have.className('my-thumbnail');
  });

  it('sets source url', () => {
    const component = mount(<ThumbnailLink src="assets/img/thumbnail/01.jpg"/>);
    expect(component.find('img')).to.have.attr('src', 'assets/img/thumbnail/01.jpg');
  });

  it('sets alternative text', () => {
    const component = mount(<ThumbnailLink alt="Photo of Uranus."/>);
    expect(component.find('img')).to.have.attr('alt', 'Photo of Uranus.');
  });

});
