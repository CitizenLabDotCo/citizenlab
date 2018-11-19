import React, { PureComponent } from 'react';
import { map } from 'lodash-es';
import GetCustomFields, { GetCustomFieldsChildProps } from 'resources/GetCustomFields';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import T from 'components/T';

import { usersByRegFieldStream, IUsersByRegistrationField } from 'services/stats';

import localize, { InjectedLocalized } from 'utils/localize';

import BarChartByCategory from './charts/BarChartByCategory';

// components
import {
  Row,
} from '../';

import messages from '../messages';

import styled from 'styled-components';

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
        name: options[key] ? this.props.localize(options[key].title_multiloc) : this.props.intl.formatMessage(messages[key]),
        code: key,
      });
    });
    return res.length > 0 ? res : null;
  }

  render() {
    const { customFields, localize, startAt, endAt, currentGroupFilter } = this.props;
    const graphsArray = customFields && customFields.map((field, index) => {
      return (
        <BarChartByCategory
          className={`${(index % 2 === 1) && 'first'} halfWidth`}
          startAt={startAt}
          endAt={endAt}
          currentGroupFilter={currentGroupFilter}
          key={index}
          graphTitleString={localize(field.attributes.title_multiloc)}
          stream={usersByRegFieldStream}
          graphUnit="Users"
          convertToGraphFormat={this.convertToGraphFormat}
          customId={field.id}
        />
      );
    });

    if (graphsArray) {
      return graphsArray.filter((_, index) => index % 2 === 1).map((item, index) => {
        return (
          <Row key={index}>
            {item}
            {graphsArray.length >= index * 2 && graphsArray[index * 2]}
          </Row>
        );
      });
    }
    return null;
  }

}

const RegistrationFieldsToGraphsWithHoCs = localize<Props>(injectIntl<Props & InjectedLocalized>(RegistrationFieldsToGraphs));
export default (inputProps: InputProps) => (
  <GetCustomFields inputTypes={['select', 'multiselect', 'checkbox']}>
    {customFields => <RegistrationFieldsToGraphsWithHoCs {...inputProps} customFields={customFields} />}
  </GetCustomFields>
);
