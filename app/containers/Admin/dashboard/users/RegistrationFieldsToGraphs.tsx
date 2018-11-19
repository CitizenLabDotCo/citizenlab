import React, { PureComponent } from 'react';
import { map } from 'lodash-es';
import GetCustomFields, { GetCustomFieldsChildProps } from 'resources/GetCustomFields';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import T from 'components/T';

import { usersByRegFieldStream, IUsersByRegistrationField } from 'services/stats';

import localize, { InjectedLocalized } from 'utils/localize';

import BarChartByCategory from './charts/BarChartByCategory';
import PieChartByCategory from './charts/PieChartByCategory';

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
        name: options && options[key] ? this.props.localize(options[key].title_multiloc) : this.props.intl.formatMessage(messages[key]),
        code: key,
      });
    });
    return res.length > 0 ? res : null;
  }

  render() {
    const { customFields, localize, startAt, endAt, currentGroupFilter } = this.props;
    const graphsArray = customFields && customFields.map((field, index) => {
      if (field.attributes.input_type === 'checkbox') {
        return (
          <PieChartByCategory
            className={(index === customFields.length - 1) ? '' :`${(index % 2 === 0) && 'first'} halfWidth`}
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
      }
      return (
        <BarChartByCategory
          className={(index === customFields.length - 1) ? '' :`${(index % 2 === 0) && 'first'} halfWidth`}
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
      console.log(graphsArray);
      return graphsArray.filter((_, index) => index % 2 === 1 || index === graphsArray.length - 1).map((_, index) => {
        console.log(graphsArray);
        return (
          <Row key={index}>
            {graphsArray[index * 2]}
            {graphsArray[index * 2 + 1]}
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
