import React, { useEffect, useState } from 'react';

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

import useUsersWithIds from 'api/users/useUsersByIds';

import { FormLabel } from 'components/UI/FormComponents';
import MentionsTextArea from 'components/UI/MentionsTextArea';

import { useIntl } from 'utils/cl-intl';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';
import { getFullName } from 'utils/textUtils';

import ErrorDisplay from '../ErrorDisplay';

import { getSubtextElement } from './controlUtils';
import messages from './messages';

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
  const [initialRender, setInitialRender] = useState(true);
  const results = useUsersWithIds(data);

  const [cosponsorsText, setCosponsorsText] = useState<string | null>(null);

  useEffect(() => {
    const users = results.map((result) => result?.data);
    if (initialRender) {
      const initialCosponsorsText = users.reduce(
        (acc, cosponsorship) =>
          cosponsorship
            ? `${acc}@[${getFullName(cosponsorship.data)}](${
                cosponsorship.data.id
              }) `
            : '',
        ''
      );
      setCosponsorsText(initialCosponsorsText);
      setInitialRender(false);
    }
  }, [initialRender, results]);

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
          htmlFor={sanitizeForClassname(id)}
        />
      </Box>

      <MentionsTextArea
        id={sanitizeForClassname(id)}
        name="cosponsor_ids"
        rows={1}
        trigger=""
        userReferenceType="id"
        padding="8px 8px 12px"
        onChange={(text: string) => {
          handleOnChangeInputField(text);
        }}
        onChangeMentions={(mentions: MentionItem[]) => {
          const user_ids = mentions.map((user) => user.id);
          handleChange(path, user_ids);
        }}
        placeholder={formatMessage(messages.cosponsorsPlaceholder)}
        onBlur={() => setDidBlur(true)}
        value={cosponsorsText}
        showUniqueUsers
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
