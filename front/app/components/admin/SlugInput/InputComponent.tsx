import React from 'react';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import { Input } from '@citizenlab/cl2-component-library';

interface Props {
  onChange?: (slug: string) => void;
  slug?: string;
}
const InputComponent = ({ onChange, slug }: Props) => {
  const { formatMessage } = useIntl();
  return (
    <Input
      label={formatMessage(messages.pageSlug)}
      labelTooltipText={formatMessage(messages.slugTooltip)}
      type="text"
      onChange={onChange}
      value={slug}
    />
  );
};

export default InputComponent;
