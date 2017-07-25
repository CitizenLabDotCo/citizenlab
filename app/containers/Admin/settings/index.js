import React from 'react';
import PropTypes from 'prop-types';
import HelmetIntl from 'components/HelmetIntl';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { Saga } from 'react-redux-saga';
import { Form } from 'semantic-ui-react';
import { createStructuredSelector } from 'reselect';
import { injectTFunc } from 'containers/T/utils';
import { ChromePicker } from 'react-color';
import { FormattedMessage } from 'react-intl';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';
import { makeSelectCurrentTenant } from './selectors';
import { saveSettings } from './actions';
import { watchSaveSettings } from './sagas';
import messages from './messages';


class SettingsPage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super();

    const hexToRgb = (hex) => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      const newHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(newHex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      } : null;
    };

    const { tenant, tFunc } = props;
    const organizationName = tFunc(tenant.getIn(['attributes', 'settings', 'core', 'organization_name']).toJS());
    const colorMainHex = tenant.getIn(['attributes', 'settings', 'core', 'color_main']);
    const colorMainRGB = hexToRgb(colorMainHex);
    const displayColorPicker = false;

    this.state = {
      organizationName,
      colorMainHex,
      colorMainRGB,
      displayColorPicker,
    };
  }

  handleChangeComplete = (color) => {
    this.setState({ colorMainHex: color.hex });
  };

  openColorPicker = (e) => {
    e.preventDefault();
    this.setState({ displayColorPicker: true });
  };

  closeColorPicker = (e) => {
    e.preventDefault();
    this.setState({ displayColorPicker: false });
  };

  colorPicked = (color) => {
    this.setState({
      colorMainHex: color.hex,
      colorMainRGB: color.rgb,
    });
  };

  organizationNameChange = (e) => {
    this.setState({ organizationName: e.target.value });
  }

  hexChange = (e) => {
    this.setState({ colorMainHex: e.target.value });
  }

  save = (e) => {
    e.preventDefault();
    this.props.saveSettings(this.props.tenant.get('id'), this.props.locale, this.state.organizationName, this.state.colorMainHex);
  }

  render() {
    const { tenant } = this.props;
    const settings = tenant.getIn(['attributes', 'settings']);
    const color = {
      width: '37px',
      height: '37px',
      borderRadius: '4px',
      background: `rgba(${this.state.colorMainRGB.r}, ${this.state.colorMainRGB.g}, ${this.state.colorMainRGB.b}, 1)`,
      display: 'inline-block',
      float: 'left',
    };

    const popover = {
      position: 'absolute',
      zIndex: '2',
    };

    const cover = {
      position: 'fixed',
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px',
    };

    const colorPicker = (this.state.displayColorPicker ? (
      <div style={popover}>
        <div style={cover} onClick={this.closeColorPicker} />
        <ChromePicker disableAlpha color={this.state.colorMainHex} onChange={this.colorPicked} onChangeComplete={this.colorPicked} />
      </div>
    ) : null);

    return (
      <div>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        <h1>Settings</h1>
        <Saga saga={watchSaveSettings} />

        <Form>
          <Form.Field>
            <label htmlFor="organization_name"><FormattedMessage {...messages.organizationName} values={{ type: settings.getIn(['core', 'organization_type']) }} /></label>
            <input
              id="organization_name"
              placeholder="Organization name"
              value={this.state.organizationName}
              onChange={this.organizationNameChange}
            />
          </Form.Field>

          <Form.Field>
            <label htmlFor="color_main">Accent color</label>
            <div style={color} onClick={this.openColorPicker} />
            <input
              id="color_main"
              placeholder="Main color"
              value={this.state.colorMainHex}
              onFocus={this.openColorPicker}
              onChange={this.hexChange}
            />
            {colorPicker}
          </Form.Field>

          <Form.Button onClick={this.save}>Submit</Form.Button>
        </Form>

      </div>
    );
  }
}

SettingsPage.propTypes = {
  tenant: ImmutablePropTypes.map.isRequired,
  tFunc: PropTypes.func,
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

export default connect(mapStateToProps, mapDispatchToProps)(injectTFunc(SettingsPage));
