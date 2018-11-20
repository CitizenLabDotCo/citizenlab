import React, { PureComponent } from 'react';
import { map } from 'lodash-es';
import GetCustomFields, { GetCustomFieldsChildProps } from 'resources/GetCustomFields';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

import { usersByRegFieldStream, IUsersByRegistrationField } from 'services/stats';

import localize, { InjectedLocalized } from 'utils/localize';

import BarChartByCategory from './charts/BarChartByCategory';
import PieChartByCategory from './charts/PieChartByCategory';

import messages from '../messages';

interface InputProps {
  currentGroupFilter: string | null;
  startAt: string | null | undefined;
  endAt: string | null;
}

interface DataProps {
  customFields: GetCustomFieldsChildProps;
}

interface Props extends InputProps, DataProps { }

class RegistrationFieldsToGraphs extends PureComponent<Props & InjectedIntlProps & InjectedLocalized> {
  convertToGraphFormat = (data: IUsersByRegistrationField) => {
    const { series: { users }, options } = data;
    const res = map(users, (value, key) => {

      return ({
        value,
        name: options && options[key] ? this.props.localize(options[key].title_multiloc) : this.props.intl.formatMessage(messages[key]),
        code: key,
      });
    });
    return res.length > 0 ? res : null;
  }

  render() {
    const { customFields, localize, startAt, endAt, currentGroupFilter } = this.props;
    if (!customFields) {
      return null;
    }
    return customFields.map((field, index) => {
      if (field.attributes.key === 'gender') {
        return null;
      }
      if (field.attributes.input_type === 'checkbox') {
        return (
            <PieChartByCategory
              startAt={startAt}
              endAt={endAt}
              key={index}
              currentGroupFilter={currentGroupFilter}
              graphTitleString={localize(field.attributes.title_multiloc)}
              stream={usersByRegFieldStream}
              graphUnit="users"
              convertToGraphFormat={this.convertToGraphFormat}
              customId={field.id}
            />
        );
      }
      return (
          <BarChartByCategory
            startAt={startAt}
            endAt={endAt}
            key={index}
            currentGroupFilter={currentGroupFilter}
            graphTitleString={localize(field.attributes.title_multiloc)}
            stream={usersByRegFieldStream}
            graphUnit="users"
            convertToGraphFormat={this.convertToGraphFormat}
            customId={field.id}
          />
      );
    });
  }
}

const RegistrationFieldsToGraphsWithHoCs = localize<Props>(injectIntl<Props & InjectedLocalized>(RegistrationFieldsToGraphs));

export default (inputProps: InputProps) => (
  <GetCustomFields inputTypes={['select', 'multiselect', 'checkbox']}>
    {customFields => <RegistrationFieldsToGraphsWithHoCs {...inputProps} customFields={customFields} />}
  </GetCustomFields>
);
