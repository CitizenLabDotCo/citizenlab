/*
 *
 * T
 * https://github.com/CitizenLabDotCo/cl2-front/wiki/docs_T
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { makeSelectSetting } from 'utils/tenant/selectors';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';
import { findTranslatedText } from './utils';

export class T extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.fallbackUserLocale = 'nl';
    this.fallbackTenantLocales = ['en', 'nl', 'fr'];
  }

  render() {
    const { value, userLocale, tenantLocales } = this.props;
    if (!this.props.value) {
      throw new Error('Must pass a value prop to <T />');
    }

    return (
      <div className="cl-translated-text">
        { findTranslatedText(value, userLocale || this.fallbackUserLocale, tenantLocales || this.fallbackTenantLocales) }
      </div>
    );
  }
}

T.propTypes = {
  value: PropTypes.object,
  userLocale: PropTypes.string,
  tenantLocales: PropTypes.array,
};

const mapStateToProps = createStructuredSelector({
  userLocale: makeSelectLocale(),
  tenantLocales: makeSelectSetting(['core', 'locales']),
});

export default connect(mapStateToProps)(T);
