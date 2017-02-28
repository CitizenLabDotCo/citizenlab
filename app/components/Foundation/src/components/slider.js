import React, { Component } from 'react';
import classNames from 'classnames';

// TODO: Add support for changing the values.

/**
 * Slider component.
 * http://foundation.zurb.com/sites/docs/slider.html
 */
export class Slider extends Component {
  constructor() {
    super();

    this.state = { value: 0 };
  }

  componentWillMount() {
    this.setState({ value: this.props.initialStart || 0 });
  }

  render() {
    const { handle: handleProps, fill: fillProps } = this.props;

    return (
      <div {...this.props} className={classNameFromProps(this.props)}>
        <SliderHandle {...handleProps}/>
        <SliderFill {...fillProps}/>
      </div>
    );
  }
}

/**
 * Two-handle slider component.
 * http://foundation.zurb.com/sites/docs/slider.html#two-handles
 */
export class TwoHandleSlider extends Component {
  constructor() {
    super();

    this.state = { minValue: 0, maxValue: 100 };
  }

  componentWillMount() {
    this.setState({
      minValue: this.props.initialStart || 0,
      maxValue: this.props.initialEnd || 100
    });
  }

  render() {
    const { minHandle: minHandleProps, maxHandle: maxHandleProps, fill: fillProps } = this.props;

    return (
      <div {...this.props} className={classNameFromProps(this.props)}>
        <SliderHandle {...minHandleProps}/>
        <SliderHandle {...maxHandleProps}/>
        <SliderFill {...fillProps}/>
      </div>
    );
  }
}

/**
 * Slider handle sub-component.
 *
 * @param {Object} props
 * @returns {XML}
 */
export const SliderHandle = props => {
  return (
    <span>
      <span {...props} role="slider"/>
      <input type="hidden"/>
    </span>
  );
};

/**
 * Slider fill sub-component.
 *
 * @param {Object} props
 * @returns {XML}
 */
export const SliderFill = props => (
  <span className={props.className || 'slider-fill'}/>
);

/**
 * Creates the slider class name from the given properties.
 * This method allows us to share code between the `Slider` and `TwoHandleSlider` components.
 *
 * @param {Object} props
 * @returns {string}
 */
function classNameFromProps(props) {
  return classNames(
    props.className || 'slider',
    {
      'vertical': props.isVertical,
      'disabled': props.isDisabled
    }
  );
}
