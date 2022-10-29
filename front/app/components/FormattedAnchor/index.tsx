import React from 'react';
import { MessageDescriptor } from 'react-intl';
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import styled from 'styled-components';

const Anchor = styled.a``;

type Props = {
  // root message that contains a mutilingual anchor link
  mainMessage: MessageDescriptor;
  mainMessageLinkKey?: string; // key to be replaced by link, defaults to 'link'
  // message representing the url
  href: string;
  // message representing the text inside the link, clickable part.
  linkTextMessage: MessageDescriptor;
};

const FormattedAnchor = ({
  mainMessage,
  mainMessageLinkKey,
  linkTextMessage,
  href,
}: Props) => {
  const allValues = {};
  allValues[mainMessageLinkKey || 'link'] = (
    <Anchor href={href} target="_blank">
      <FormattedMessage {...linkTextMessage} />
    </Anchor>
  );
  return <FormattedMessage {...mainMessage} values={allValues} />;
};
export default FormattedAnchor;
