import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { fromJS } from 'immutable';
import { connect } from 'react-redux';
import _ from 'lodash';
import { createStructuredSelector } from 'reselect';
import { injectTFunc } from 'containers/T/utils';
import { FormattedMessage } from 'react-intl';
import Input from 'components/UI/Input';
import Label from 'components/UI/Label';
import Button from 'components/UI/Button';
import TextArea from 'components/UI/TextArea';
import MultipleSelect from 'components/UI/MultipleSelect';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';
import { appLocalePairs } from 'i18n.js';
import { makeSelectCurrentTenantImm } from 'utils/tenant/selectors';
import { saveSettings } from '../actions';
import messages from '../messages';


class SettingsGeneralTab extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.state = {
      changedAttributes: fromJS({}),
    };
  }

  changeAttribute(path, value) {
    this.setState({
      changedAttributes: this.state.changedAttributes.setIn(path, value),
    });
  }

  changeLocales(value) {
    const locales = value.map((option) => option.value);
    const path = ['settings', 'core', 'locales'];
    this.setState({
      changedAttributes: this.state.changedAttributes.setIn(path, fromJS(locales)),
    });
  }

  save = (e) => {
    e.preventDefault();
    this.props.saveSettings(this.props.tenant.get('id'), this.state.changedAttributes.toJS());
  }

  localeOptions = () => {
    return _.map(appLocalePairs, (label, locale) => ({
      value: locale,
      label,
    }));
  }

  localesToOptions = (locales) => {
    return locales.map((locale) => ({
      value: locale,
      label: appLocalePairs[locale],
    }));
  }

  render() {
    const updatedTenant = this.props.tenant.update('attributes', (t) => {
      return t.mergeDeep(this.state.changedAttributes);
    });
    const settings = updatedTenant.getIn(['attributes', 'settings']);
    const localesValue = this.localesToOptions(settings.getIn(['core', 'locales']).toJS());

    return (
      <div>

        <h1><FormattedMessage {...messages.titleBasic} /></h1>
        <p><FormattedMessage {...messages.subTitleBasic} /></p>

        <div>
          <Label>
            <FormattedMessage {...messages.organizationName} values={{ type: settings.getIn(['core', 'organization_type']) }} />
          </Label>
          <Input
            id="organization_name"
            value={settings.getIn(['core', 'organization_name', this.props.locale])}
            onChange={(value) => this.changeAttribute(['settings', 'core', 'organization_name', this.props.locale], value)}
          />
        </div>

        <div>
          <Label>
            <FormattedMessage {...messages.languages} values={{ type: settings.getIn(['core', 'locales']) }} />
          </Label>
          <MultipleSelect
            id="locales"
            value={localesValue}
            onChange={(value) => this.changeLocales(value)}
            options={this.localeOptions()}
            multi
          />
        </div>

        <div>
          <Label>
            <FormattedMessage {...messages.headerSlogan} />
          </Label>
          <Input
            id="header_slogan"
            value={settings.getIn(['core', 'header_slogan', this.props.locale])}
            onChange={(value) => this.changeAttribute(['settings', 'core', 'header_slogan', this.props.locale], value)}
          />
        </div>

        <div>
          <Label>
            <FormattedMessage {...messages.metaTitle} />
          </Label>
          <Input
            id="meta_title"
            value={settings.getIn(['core', 'meta_title', this.props.locale])}
            onChange={(value) => this.changeAttribute(['settings', 'core', 'meta_title', this.props.locale], value)}
          />
        </div>

        <div>
          <Label>
            <FormattedMessage {...messages.metaDescription} />
          </Label>
          <TextArea
            id="meta_description"
            rows={5}
            value={settings.getIn(['core', 'meta_description', this.props.locale])}
            onChange={(value) => this.changeAttribute(['settings', 'core', 'meta_description', this.props.locale], value)}
          />
        </div>


        <Button onClick={this.save}>
          <FormattedMessage {...messages.save} />
        </Button>

      </div>
    );
  }
}

SettingsGeneralTab.propTypes = {
  tenant: ImmutablePropTypes.map.isRequired,
  locale: PropTypes.any,
  saveSettings: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  tenant: makeSelectCurrentTenantImm(),
  locale: makeSelectLocale(),
});

const mapDispatchToProps = {
  saveSettings,
};

export default connect(mapStateToProps, mapDispatchToProps)(injectTFunc(SettingsGeneralTab));
