/* eslint-disable react/no-danger */
/*
 *
 * T
 * https://github.com/CitizenLabDotCo/cl2-front/wiki/docs_T
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import ImmutablePropTypes from 'react-immutable-proptypes';

import { makeSelectSetting } from 'utils/tenant/selectors';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';
import { findTranslatedText } from './utils';

export const fallbackUserLocale = 'nl';
export const fallbackTenantLocales = ['en', 'nl', 'fr'];

export class T extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.fallbackUserLocale = fallbackUserLocale;
    this.fallbackTenantLocales = fallbackTenantLocales;
  }

  render() {
    const { value, userLocale, tenantLocales } = this.props;
    if (!this.props.value) {
      throw new Error('Must pass a value prop to <T />');
    }

    return (
      <span
        style={{
          fontSize: 'inherit',
        }}
        className="cl-translated-text"
        dangerouslySetInnerHTML={{ __html: findTranslatedText(value, userLocale || this.fallbackUserLocale, tenantLocales || this.fallbackTenantLocales) }}
      />
    );
  }
}

T.propTypes = {
  value: PropTypes.object,
  userLocale: PropTypes.string,
  tenantLocales: ImmutablePropTypes.list,
};

const mapStateToProps = createStructuredSelector({
  userLocale: makeSelectLocale(),
  tenantLocales: makeSelectSetting(['core', 'locales']),
});

export default connect(mapStateToProps)(T);
