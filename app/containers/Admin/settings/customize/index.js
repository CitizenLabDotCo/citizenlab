import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { Form } from 'semantic-ui-react';
import { createStructuredSelector } from 'reselect';
import { injectTFunc } from 'containers/T/utils';
import { FormattedMessage } from 'react-intl';
import Label from 'components/UI/Label';
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

        <Form>

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

          <Form.Button onClick={this.save}>Submit</Form.Button>
        </Form>

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
