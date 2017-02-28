import React from 'react';
import { createRenderer } from 'react-addons-test-utils';
import { render } from 'enzyme';
import { expect } from 'chai';
import { FlexVideo } from '../../src/components/flex-video';

describe('FlexVideo component', () => {

  it('sets tag name', () => {
    const component = render(<FlexVideo/>);
    expect(component).to.have.tagName('div');
  });

  it('sets default class name', () => {
    const component = render(<FlexVideo/>);
    expect(component).to.have.className('flex-video');
  });

  it('does not set default class name', () => {
    const component = render(<FlexVideo noDefaultClassName/>);
    expect(component).to.not.have.className('flex-video');
  });

  it('sets custom class name', () => {
    const component = render(<FlexVideo className="my-flex-video"/>);
    expect(component).to.have.className('my-flex-video');
  });

  it('sets widescreen', () => {
    const component = render(<FlexVideo isWidescreen/>);
    expect(component).to.have.className('widescreen');
    expect(component).to.not.have.attr('isWidescreen');
  });

  it('sets vimeo', () => {
    const component = render(<FlexVideo isVimeo/>);
    expect(component).to.have.className('vimeo');
    expect(component).to.not.have.attr('isVimeo');
  });

  it('sets contents', () => {
    const renderer = createRenderer();
    renderer.render(<FlexVideo><iframe src="https://example.com"></iframe></FlexVideo>);
    const output = renderer.getRenderOutput();
    expect(output).jsx.to.include(<iframe src="https://example.com"></iframe>);
  });

});
