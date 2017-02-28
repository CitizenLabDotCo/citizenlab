import React from 'react';
import { createRenderer } from 'react-addons-test-utils';
import { render } from 'enzyme';
import { expect } from 'chai';
import {
  Progress,
  ProgressMeter,
  ProgressMeterWithText,
  ProgressMeterText,
  NativeProgress
} from '../../src/components/progress-bar';
import { Colors } from '../../src/enums';

// TODO: Add test cases for invalid enum values

describe('Progress component', () => {

  it('sets tag name', () => {
    const component = render(<Progress/>);
    expect(component).to.have.tagName('div');
  });

  it('sets default class name', () => {
    const component = render(<Progress/>);
    expect(component).to.have.className('progress');
  });

  it('does not set default class name', () => {
    const component = render(<Progress noDefaultClassName/>);
    expect(component).to.not.have.className('progress');
  });

  it('sets custom class name', () => {
    const component = render(<Progress className="my-progress"/>);
    expect(component).to.have.className('my-progress');
  });

  it('sets role', () => {
    const component = render(<Progress/>);
    expect(component).to.have.attr('role', 'progressbar');
  });

  it('sets color', () => {
    const component = render(<Progress color={Colors.SUCCESS}/>);
    expect(component).to.have.className('success');
    expect(component).to.not.have.attr('color');
  });

  it('sets minimum value', () => {
    const component = render(<Progress min={0}/>);
    expect(component).to.have.attr('aria-valuemin', '0');
  });

  it('sets maximum value', () => {
    const component = render(<Progress max={100}/>);
    expect(component).to.have.attr('aria-valuemax', '100');
  });

  it('sets current value', () => {
    const component = render(<Progress value={50}/>);
    expect(component).to.have.attr('aria-valuenow', '50');
  });

  it('sets value text', () => {
    const component = render(<Progress valueText="50 percent"/>);
    expect(component).to.have.attr('aria-valuetext', '50 percent');
  });

  it('sets contents', () => {
    const renderer = createRenderer();
    renderer.render(<Progress value={50}/>);
    const output = renderer.getRenderOutput();
    expect(output).jsx.to.include(<ProgressMeter style={{ width: '50%' }}/>);
  });

});

describe('ProgressMeter component', () => {

  it('sets tag name', () => {
    const component = render(<ProgressMeter/>);
    expect(component).to.have.tagName('div');
  });

  it('sets default class name', () => {
    const component = render(<ProgressMeter/>);
    expect(component).to.have.className('progress-meter');
  });

  it('does not set default class name', () => {
    const component = render(<ProgressMeter noDefaultClassName/>);
    expect(component).to.not.have.className('progress-meter');
  });

  it('sets custom class name', () => {
    const component = render(<ProgressMeter className="my-progress-meter"/>);
    expect(component).to.have.className('my-progress-meter');
  });

  it('sets width', () => {
    const component = render(<ProgressMeter widthPercent={75}/>);
    expect(component).to.have.style({ width: '75%' });
  });

});

describe('ProgressMeterWithText component', () => {

  it('does not set default class name', () => {
    const component = render(<ProgressMeterWithText noDefaultClassName/>);
    expect(component).to.not.have.className('progress-meter');
  });

  it('sets text', () => {
    const renderer = createRenderer();
    renderer.render(<ProgressMeterWithText text="25%"/>);
    const output = renderer.getRenderOutput();
    expect(output).jsx.to.include(<ProgressMeterText>25%</ProgressMeterText>);
  });

});

describe('ProgressMeterText component', () => {

  it('sets tag name', () => {
    const component = render(<ProgressMeterText/>);
    expect(component).to.have.tagName('p');
  });

  it('sets default class name', () => {
    const component = render(<ProgressMeterText/>);
    expect(component).to.have.className('progress-meter-text');
  });

  it('does not set default class name', () => {
    const component = render(<ProgressMeterText noDefaultClassName/>);
    expect(component).to.not.have.className('progress-meter-text');
  });

  it('sets custom class name', () => {
    const component = render(<ProgressMeterText className="my-progress-meter-text"/>);
    expect(component).to.have.className('my-progress-meter-text');
  });

  it('sets contents', () => {
    const component = render(<ProgressMeterText>25%</ProgressMeterText>);
    expect(component).to.have.text('25%');
  });

});

describe('NativeProgress component', () => {

  it('sets tag name', () => {
    const component = render(<NativeProgress/>);
    expect(component).to.have.tagName('progress');
  });

  it('sets custom class name', () => {
    const component = render(<NativeProgress className="my-progress"/>);
    expect(component).to.have.className('my-progress');
  });

  it('sets color', () => {
    const component = render(<NativeProgress color={Colors.SUCCESS}/>);
    expect(component).to.have.className('success');
    expect(component).to.not.have.attr('color');
  });

  it('sets maximum value', () => {
    const component = render(<NativeProgress max={100}/>);
    expect(component).to.have.attr('max', '100');
  });

  it('sets current value', () => {
    const component = render(<NativeProgress value={50}/>);
    expect(component).to.have.attr('value', '50');
  });

  it('sets contents', () => {
    const component = render(<NativeProgress>25%</NativeProgress>);
    expect(component).to.have.text('25%');
  });

});
