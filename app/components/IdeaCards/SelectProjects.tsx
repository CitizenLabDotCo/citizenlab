import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import FilterSelector from 'components/FilterSelector';

// resources
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';

// i18n
import { getLocalized } from 'utils/i18n';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

type DataProps = {
  tenant: GetTenantChildProps;
  locale: GetLocaleChildProps;
  projects: GetProjectsChildProps;
};

type InputProps = {
  id?: string | undefined;
  onChange: (value: any) => void;
};

type Props = InputProps & DataProps;

type State = {
  selectedValues: string[];
  titleKey: number;
};

class SelectProjects extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props as any);
    this.state = {
      selectedValues: [],
      titleKey: Math.floor(Math.random() * 10000000)
    };
  }

  handleOnChange = (selectedValues) => {
    this.setState({ selectedValues });
    this.props.onChange(selectedValues);
  }

  render() {
    const { selectedValues, titleKey } = this.state;
    const { tenant, locale, projects } = this.props;
    const projectsList = projects.projectsList;
    let options: any = [];

    if (!isNilOrError(tenant) && locale && projectsList && projectsList.length > 0) {
      const tenantLocales = tenant.attributes.settings.core.locales;

      options = projectsList.map(project => {
        return {
          text: getLocalized(project.attributes.title_multiloc, locale, tenantLocales),
          value: project.id
        };
      });

      if (options && options.length > 0) {
        return (
          <FilterSelector
            id="e2e-project-filter-selector"
            title={<FormattedMessage {...messages.projectFilterTitle} key={titleKey} />}
            name="projects"
            selected={selectedValues}
            values={options}
            onChange={this.handleOnChange}
            multiple={true}
            right="-10px"
            mobileLeft="-5px"
          />
        );
      }
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  tenant: <GetTenant />,
  locale: <GetLocale />,
  projects: <GetProjects publicationStatuses={['published']} sort="new" />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <SelectProjects {...dataProps} {...inputProps} />}
  </Data>
);
