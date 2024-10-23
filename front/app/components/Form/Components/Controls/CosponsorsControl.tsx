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

import { IUser } from 'api/users/types';
import useUsersWithIds from 'api/users/useUsersByIds';

import { FormLabel } from 'components/UI/FormComponents';
import MentionsTextArea from 'components/UI/MentionsTextArea';

import { useIntl } from 'utils/cl-intl';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';
import { getFullName } from 'utils/textUtils';

import ErrorDisplay from '../ErrorDisplay';

import { getSubtextElement } from './controlUtils';
import messages from './messages';

const CosponsorsControlInner = ({
  uischema,
  schema,
  handleChange,
  path,
  errors,
  required,
  visible,
  id,
  users,
}: ControlProps & WrappedComponentProps & { users: IUser[] }) => {
  const initialCosponsorsText = users.reduce(
    (acc, cosponsor) =>
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      `${acc}@[${getFullName(cosponsor?.data)}](${cosponsor?.data.id}) `,
    ''
  );

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

// Wrapping the control in a component that fetches the users with the given ids
// to make sure their names display correctly in the mentions text area
const CosponsorsControlOuter = (
  props: ControlProps & WrappedComponentProps
) => {
  const results = useUsersWithIds(props.data);
  const users = results.map((result) => result.data);

  if (results.some((result) => !result.data)) {
    return null;
  }
  return <CosponsorsControlInner {...props} users={users as IUser[]} />;
};

export default withJsonFormsControlProps(CosponsorsControlOuter);

export const cosponsorsControlTester: RankedTester = rankWith(
  1000,
  scopeEndsWith('cosponsor_ids')
);
