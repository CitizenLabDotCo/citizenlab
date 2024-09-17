import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import {
  ControlProps,
  RankedTester,
  rankWith,
  scopeEndsWith,
} from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { WrappedComponentProps } from 'react-intl';
import { MentionItem } from 'react-mentions';

import { FormLabel } from 'components/UI/FormComponents';
import MentionsTextArea from 'components/UI/MentionsTextArea';

import { useIntl } from 'utils/cl-intl';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../ErrorDisplay';

import { getSubtextElement } from './controlUtils';
import messages from './messages';

const cosponsorships: any = [];

const CosponsorsControl = ({
  uischema,
  schema,
  data,
  handleChange,
  path,
  errors,
  required,
  visible,
  id,
}: ControlProps & WrappedComponentProps) => {
  const initialCosponsorsText = cosponsorships
    ? cosponsorships.reduce(
        (acc, cosponsorship) =>
          `${acc}@[${cosponsorship.name}](${cosponsorship.user_id}) `,
        ''
      )
    : null;
  const [cosponsorsText, setCosponsorsText] = useState<string | null>(
    initialCosponsorsText
  );
  const { formatMessage } = useIntl();
  const [didBlur, setDidBlur] = useState(false);

  if (!visible) {
    return null;
  }

  const handleOnChangeInputField = (text: string) => {
    setCosponsorsText(text);
  };

  return (
    <>
      <Box display="flex">
        <FormLabel
          labelValue={getLabel(uischema, schema, path)}
          optional={!required}
          subtextValue={getSubtextElement(uischema.options?.description)}
          subtextSupportsHtml
        />
      </Box>

      <MentionsTextArea
        id="e2e-idea-form-cosponsors-input-field"
        name="cosponsor_ids"
        rows={1}
        trigger=""
        userReferenceType="id"
        padding="8px 8px 12px"
        // value={data}
        onChange={(text: string) => {
          handleOnChangeInputField(text);
        }}
        onChangeMentions={(mentions: MentionItem[]) => {
          const user_ids = mentions.map((user) => user.id);
          handleChange(path, user_ids);
        }}
        placeholder={formatMessage(messages.cosponsorsPlaceholder)}
        onBlur={() => setDidBlur(true)}
        showUniqueUsers
        value={cosponsorsText}
      />
      <ErrorDisplay
        inputId={sanitizeForClassname(id)}
        didBlur={didBlur}
        ajvErrors={errors}
        fieldPath={path}
      />
    </>
  );
};

export default withJsonFormsControlProps(CosponsorsControl);

export const cosponsorsControlTester: RankedTester = rankWith(
  1000,
  scopeEndsWith('cosponsor_ids')
);
