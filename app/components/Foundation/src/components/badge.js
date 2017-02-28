import React, { PropTypes } from 'react';
import { BadgeColors } from '../enums';
import { GeneralPropTypes, createClassName, generalClassNames, removeProps, objectKeys, objectValues } from '../utils';

/**
 * Badge component.
 * http://foundation.zurb.com/sites/docs/badge.html
 *
 * @param {Object} props
 * @returns {Object}
 */
export const Badge = (props) => {
  const className = createClassName(
    props.noDefaultClassName ? null : 'badge',
    props.className,
    props.color,
    generalClassNames(props)
  );

  const passProps = removeProps(props, objectKeys(Badge.propTypes));

  return <span {...passProps} className={className}/>;
};

Badge.propTypes = {
  ...GeneralPropTypes,
  color: PropTypes.oneOf(objectValues(BadgeColors))
};
