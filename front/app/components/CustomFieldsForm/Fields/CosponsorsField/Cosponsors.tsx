import React, { useState } from 'react';

import { MentionItem } from 'react-mentions';

import { IFlatCustomField } from 'api/custom_fields/types';
import { IUser } from 'api/users/types';
import useUsersWithIds from 'api/users/useUsersByIds';

import messages from 'components/Form/Components/Controls/messages';
import MentionsTextArea from 'components/UI/MentionsTextArea';

import { useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

interface InnerProps {
  users: IUser[];
  question: IFlatCustomField;
  onChange: (values?: string[]) => void;
}

const CosponsorsInner = ({ question, users, onChange }: InnerProps) => {
  const { formatMessage } = useIntl();

  const initialCosponsorsText = users.reduce(
    (acc, cosponsor) =>
      `${acc}@[${getFullName(cosponsor.data)}](${cosponsor.data.id}) `,
    ''
  );

  const [cosponsorsText, setCosponsorsText] = useState<string | null>(
    initialCosponsorsText
  );

  return (
    <MentionsTextArea
      id={question.key}
      name="cosponsor_ids"
      rows={1}
      trigger=""
      userReferenceType="id"
      padding="8px 8px 12px"
      onChange={setCosponsorsText}
      onChangeMentions={(mentions: MentionItem[]) => {
        const user_ids = mentions.map((user) => user.id);
        onChange(user_ids);
      }}
      placeholder={formatMessage(messages.cosponsorsPlaceholder)}
      value={cosponsorsText}
      showUniqueUsers
    />
  );
};

interface OuterProps {
  value?: string[];
  question: IFlatCustomField;
  onChange: (values?: string[]) => void;
}

const CosponsorsOuter = (props: OuterProps) => {
  const results = useUsersWithIds(props.value);
  const users = results.map((result) => result.data);

  if (results.some((result) => !result.data)) {
    return null;
  }

  return <CosponsorsInner {...props} users={users as IUser[]} />;
};

export default CosponsorsOuter;
