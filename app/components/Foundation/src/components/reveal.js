import React, { PropTypes } from 'react';
import { GeneralPropTypes, createClassName, generalClassNames, removeProps, objectKeys } from '../utils';
import $ from 'jquery';

/**
 * Reveal component.
 * http://foundation.zurb.com/sites/docs/reveal.html
 *
 * @param {Object} props
 * @returns {Object}
 */

export class Reveal extends React.PureComponent {
  componentDidMount() {
    this.$elm = $(this.elm);
    this.instance = new Foundation.Reveal(this.$elm);
  }

  componentWillUnmount() {
    this.instance.destroy();
  }

  render() {
    const props = this.props;
    const className = createClassName(
      props.noDefaultClassName ? null : 'reveal',
      props.className,
      {
        'tiny': props.isTiny,
        'small': props.isSmall,
        'large': props.isLarge,
        'full': props.isFullscreen
      },
      generalClassNames(props)
    );

    const passProps = removeProps(props, objectKeys(Reveal.propTypes));

    return (
      <div {...passProps} className={className} data-reveal ref={ref => this.elm = ref}>
        <button className="close-button" aria-label="Close reveal" type="button" onClick={() => this.instance.close()}>
          <span aria-hidden="true">&times;</span>
        </button>

        {this.props.children}
      </div>
    );
  };
};

Reveal.propTypes = {
  ...GeneralPropTypes,
  isTiny: PropTypes.bool,
  isSmall: PropTypes.bool,
  isLarge: PropTypes.bool,
  isFullscreen: PropTypes.bool
};
