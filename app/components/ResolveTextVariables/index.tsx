import React, { PureComponent } from 'react';
import { mapValues, reduce } from 'lodash-es';
import { Multiloc } from 'typings';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetTenant';
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

      const initiatives = tenant.attributes.settings.initiatives;
      if (initiatives) {
        if (initiatives.eligibility_criteria) {
          textVariables.initiativesEligibilityCriteria = localize(
            initiatives.eligibility_criteria
          );
        }
        if (initiatives.threshold_reached_message) {
          textVariables.initiativesThresholdReachedMessage = localize(
            initiatives.threshold_reached_message
          );
        }

        textVariables.initiativesVotingThreshold = initiatives.voting_threshold.toString();
        textVariables.initiativesDaysLimit = initiatives.days_limit.toString();
      }

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
