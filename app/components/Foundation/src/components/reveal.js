import React, { PropTypes } from 'react';
import { GeneralPropTypes, createClassName, generalClassNames, removeProps, objectKeys } from '../utils';

/**
 * Reveal component.
 * http://foundation.zurb.com/sites/docs/reveal.html
 *
 * @param {Object} props
 * @returns {Object}
 */

export const Reveal = (props) => {
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

  return <div {...passProps} className={className} data-reveal/>;
};

Reveal.propTypes = {
  ...GeneralPropTypes,
  isTiny: PropTypes.bool,
  isSmall: PropTypes.bool,
  isLarge: PropTypes.bool,
  isFullscreen: PropTypes.bool
};
