import React from 'react';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import Input from 'components/HookForm/Input';

interface Props {
  slug: string;
}
const HookFormInputComponent = ({ slug }: Props) => {
  const { formatMessage } = useIntl();
  return (
    <Input
      label={formatMessage(messages.urlSlugLabel)}
      labelTooltipText={formatMessage(messages.slugTooltip)}
      type="text"
      name="slug"
      value={slug}
    />
  );
};

export default HookFormInputComponent;
