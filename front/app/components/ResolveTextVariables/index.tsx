import React, { PureComponent } from 'react';

import { mapValues, reduce } from 'lodash-es';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import { Multiloc } from 'typings';

import { isNilOrError } from 'utils/helperUtils';
import injectLocalize, { InjectedLocalized } from 'utils/localize';

interface InputProps {
  value: Multiloc;
  children: (multiloc: Multiloc) => JSX.Element;
}

interface DataProps {
  tenant: GetAppConfigurationChildProps;
}

interface Props extends InputProps, DataProps, InjectedLocalized {}

/**
 * Given a multiloc as `value` prop, calls the `children` function prop
 * with the same multiloc but with substituted patterns in the translations.
 * E.g. {en: 'This is $|orgName|'} becomes {en: 'This is New York'}
 */
class ResolveTextVariables extends PureComponent<Props> {
  tenantVariables = () => {
    const { tenant, localize } = this.props;

    if (!isNilOrError(tenant)) {
      const textVariables: { [key: string]: string } = {
        orgName: localize(tenant.attributes.settings.core.organization_name),
      };

      const initiativeSettings = tenant.attributes.settings.initiatives;

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (initiativeSettings.eligibility_criteria) {
        textVariables.initiativesEligibilityCriteria = localize(
          initiativeSettings.eligibility_criteria
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (initiativeSettings.threshold_reached_message) {
        textVariables.initiativesThresholdReachedMessage = localize(
          initiativeSettings.threshold_reached_message
        );
      }

      textVariables.initiativesVotingThreshold =
        initiativeSettings.reacting_threshold.toString();
      textVariables.initiativesDaysLimit =
        initiativeSettings.days_limit.toString();

      return textVariables;
    }

    return null;
  };

  valueWithreplacedVariables = (): Multiloc => {
    const variables = this.tenantVariables();

    return mapValues(this.props.value, (text) =>
      reduce(
        variables,
        (input, replacement, pattern) => {
          const re = new RegExp(`\\$\\|${pattern}\\|`, 'g');
          return (input || '').replace(re, replacement || '');
        },
        text
      )
    );
  };

  render() {
    return this.props.children(this.valueWithreplacedVariables());
  }
}

const ResolveTextVariablesWithHOCS = injectLocalize<InputProps & DataProps>(
  ResolveTextVariables
);

export default (inputProps: InputProps) => (
  <GetAppConfiguration>
    {(tenant) => (
      <ResolveTextVariablesWithHOCS {...inputProps} tenant={tenant} />
    )}
  </GetAppConfiguration>
);
