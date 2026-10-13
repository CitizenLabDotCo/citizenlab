import React from 'react';

import { useNode } from '@craftjs/core';

import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  name: string;
}

const TitleMultilocInput = ({ name }: Props) => {
  const { formatMessage } = useIntl();

  const {
    actions: { setProp },
    titleMultiloc,
  } = useNode((node) => ({
    titleMultiloc: node.data.props.titleMultiloc,
  }));

  return (
    <InputMultilocWithLocaleSwitcher
      id={name}
      type="text"
      label={formatMessage(messages.title)}
      name={name}
      valueMultiloc={titleMultiloc}
      onChange={(valueMultiloc) =>
        setProp((props) => (props.titleMultiloc = valueMultiloc))
      }
    />
  );
};

export default TitleMultilocInput;
