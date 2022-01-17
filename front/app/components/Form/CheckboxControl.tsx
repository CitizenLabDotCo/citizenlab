import { withJsonFormsControlProps } from '@jsonforms/react';
import { Checkbox } from 'cl2-component-library';
import {
  ControlProps,
  isBooleanControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import React from 'react';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import ErrorDisplay from './ErrorDisplay';
import { FormLabelValue } from 'components/UI/FormComponents';
import styled from 'styled-components';

const StyledFormLabelValue = styled(FormLabelValue)`
  display: block;
  margin-bottom: 10px;
`;

const CheckboxControl = (props: ControlProps & InjectedIntlProps) => {
  const { data, handleChange, path, errors, schema } = props;

  return (
    <>
      {schema.title && (
        <StyledFormLabelValue noSpace labelValue={schema.title} />
      )}
      <Checkbox
        checked={Boolean(data)}
        onChange={() => handleChange(path, !data)}
        label={schema.description || null}
      />
      <ErrorDisplay ajvErrors={errors} fieldPath={path} />
    </>
  );
};

export default withJsonFormsControlProps(injectIntl(CheckboxControl));

export const checkboxControlTester: RankedTester = rankWith(
  4,
  isBooleanControl
);
