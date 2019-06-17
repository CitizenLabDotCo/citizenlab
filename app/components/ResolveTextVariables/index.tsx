import React, { PureComponent } from 'react';
import { mapValues, reduce } from 'lodash-es';
import { Multiloc } from 'typings';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import { isNilOrError } from 'utils/helperUtils';
import injectLocalize, { InjectedLocalized } from 'utils/localize';

interface InputProps {
  value: Multiloc;
  children: (multiloc: Multiloc) => JSX.Element;
}

interface DataProps {
  tenant: GetTenantChildProps;
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
      return {
        orgName: localize(tenant.attributes.settings.core.organization_name)
      };
    }

    return null;
  }

  valueWithreplacedVariables = (): Multiloc => {
    const variables = this.tenantVariables();

    return mapValues(this.props.value, (text) => (
      reduce(
        variables,
        (input, replacement, pattern) => (input || '').replace(`$|${pattern}|`, replacement || ''),
        text
      )
    ));
  }

  render() {
    return this.props.children(this.valueWithreplacedVariables());
  }
}

const ResolveTextVariablesWithHOCS = injectLocalize<InputProps & DataProps>(ResolveTextVariables);

export default (inputProps: InputProps) => (
  <GetTenant>
    {tenant => <ResolveTextVariablesWithHOCS {...inputProps} tenant={tenant} />}
  </GetTenant>
);
