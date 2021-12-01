import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import CallToActionSettings from './admin/components/CallToActionSettings';
// dummy component
import Setting1 from './admin/Setting1';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.settings.customize.headerSectionStart': (_props) => (
      <Setting1 />
    ),
    'app.containers.Admin.settings.customize.headerSectionEnd': (props) => (
      <CallToActionSettings
        customizable_homepage_banner={props.customizable_homepage_banner}
      />
    ),
  },
};

export default configuration;
