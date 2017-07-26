import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { Checkbox } from 'semantic-ui-react';
import { createStructuredSelector } from 'reselect';
import { injectTFunc } from 'containers/T/utils';
import { FormattedMessage } from 'react-intl';
import Label from 'components/UI/Label';
import Button from 'components/UI/Button';
import ColorPickerInput from 'components/UI/ColorPickerInput';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';
import { makeSelectCurrentTenant } from '../selectors';
import { saveSettings } from '../actions';
import messages from '../messages';


class SettingsCustomizeTab extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    const { tenant } = props;
    this.state = {
      tenantAttributes: tenant.get('attributes'),
    };
  }

  changeAttribute(path, value) {
    this.setState({
      tenantAttributes: this.state.tenantAttributes.setIn(path, value),
    });
  }

  save = (e) => {
    e.preventDefault();
    this.props.saveSettings(this.props.tenant.get('id'), this.state.tenantAttributes.toJS());
  }

  render() {
    const settings = this.state.tenantAttributes.get('settings');
    return (
      <div>


        <h1><FormattedMessage {...messages.titleBranding} /></h1>
        <p><FormattedMessage {...messages.subTitleBranding} /></p>

        <div>
          <Label><FormattedMessage {...messages.mainColor} /></Label>
          <ColorPickerInput
            value={settings.getIn(['core', 'color_main'])}
            onChange={(value) => this.changeAttribute(['settings', 'core', 'color_main'], value)}
          />
        </div>

        <div>
          <Label><FormattedMessage {...messages.menuBgColor} /></Label>
          <ColorPickerInput
            value={settings.getIn(['core', 'color_menu_bg'])}
            onChange={(value) => this.changeAttribute(['settings', 'core', 'color_menu_bg'], value)}
          />
        </div>

        <h1><FormattedMessage {...messages.titleSignupFields} /></h1>
        <p><FormattedMessage {...messages.subTitleSignupFields} /></p>


        <div>
          <Label><FormattedMessage {...messages.gender} /></Label>
          <Checkbox
            slider
            checked={settings.getIn(['demographic_fields', 'gender'])}
            onChange={(event, value) => this.changeAttribute(['settings', 'demographic_fields', 'gender'], value.checked)}
          />
        </div>

        <div>
          <Label><FormattedMessage {...messages.domicile} /></Label>
          <Checkbox
            slider
            checked={settings.getIn(['demographic_fields', 'domicile'])}
            onChange={(event, value) => this.changeAttribute(['settings', 'demographic_fields', 'domicile'], value.checked)}
          />
        </div>

        <div>
          <Label><FormattedMessage {...messages.birthyear} /></Label>
          <Checkbox
            slider
            checked={settings.getIn(['demographic_fields', 'birthyear'])}
            onChange={(event, value) => this.changeAttribute(['settings', 'demographic_fields', 'birthyear'], value.checked)}
          />
        </div>

        <div>
          <Label><FormattedMessage {...messages.education} /></Label>
          <Checkbox
            slider
            checked={settings.getIn(['demographic_fields', 'education'])}
            onChange={(event, value) => this.changeAttribute(['settings', 'demographic_fields', 'education'], value.checked)}
          />
        </div>

        <Button onClick={this.save}>
          <FormattedMessage {...messages.save} />
        </Button>

      </div>
    );
  }
}

SettingsCustomizeTab.propTypes = {
  tenant: ImmutablePropTypes.map.isRequired,
  locale: PropTypes.any,
  saveSettings: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  tenant: makeSelectCurrentTenant(),
  locale: makeSelectLocale(),
});

const mapDispatchToProps = {
  saveSettings,
};

export default connect(mapStateToProps, mapDispatchToProps)(injectTFunc(SettingsCustomizeTab));
