import React, { PropTypes } from 'react';
import { GeneralPropTypes, createClassName, generalClassNames, removeProps, objectKeys } from '../utils';

/**
 * Tabs component.
 * http://foundation.zurb.com/sites/docs/tabs.html
 *
 * @param {Object} props
 * @returns {Object}
 */
export const Tabs = (props) => {
  const className = createClassName(
    props.noDefaultClassName ? null : 'tabs',
    props.className,
    {
      'vertical': props.isVertical
    },
    generalClassNames(props)
  );

  const passProps = removeProps(props, objectKeys(Tabs.propTypes));

  return <ul {...passProps} className={className}/>;
};

Tabs.propTypes = {
  ...GeneralPropTypes,
  isVertical: PropTypes.bool
};

/**
 * Tab item component.
 *
 * @param {Object} props
 * @returns {Object}
 */
export const TabItem = (props) => {
  const className = createClassName(
    props.noDefaultClassName ? null : 'tabs-title',
    props.className,
    {
      'is-active': props.isActive
    },
    generalClassNames(props)
  );

  const passProps = removeProps(props, objectKeys(TabItem.propTypes));

  return <li {...passProps} className={className}/>;
};

TabItem.propTypes = {
  ...GeneralPropTypes,
  isActive: PropTypes.bool
};

/**
 * Tab panel container component.
 *
 * @param {Object} props
 * @returns {Object}
 */
export const TabsContent = (props) => {
  const className = createClassName(
    props.noDefaultClassName ? null : 'tabs-content',
    props.className,
    {
      'vertical': props.isVertical
    },
    generalClassNames(props)
  );

  const passProps = removeProps(props, objectKeys(TabsContent.propTypes));

  return <div {...passProps} className={className}/>;
};

TabsContent.propTypes = {
  ...GeneralPropTypes,
  isActive: PropTypes.bool,
  isVertical: PropTypes.bool
};

/**
 * Tab panel item component.
 *
 * @param {Object} props
 * @returns {Object}
 */
export const TabPanel = (props) => {
  const className = createClassName(
    props.noDefaultClassName ? null : 'tabs-panel',
    props.className,
    {
      'is-active': props.isActive
    },
    generalClassNames(props)
  );

  const passProps = removeProps(props, objectKeys(TabPanel.propTypes));

  return <div {...passProps} className={className}/>;
};

TabPanel.propTypes = {
  ...GeneralPropTypes,
  isActive: PropTypes.bool
};
