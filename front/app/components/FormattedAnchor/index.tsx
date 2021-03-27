import React, { memo } from 'react';
// tslint:disable-next-line:no-vanilla-formatted-messages
import {
  Messages,
  FormattedMessage as OriginalFormattedMessage,
  InjectedIntlProps,
  MessageValue,
} from 'react-intl';
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import styled from 'styled-components';
import { injectIntl } from 'utils/cl-intl';

const Anchor = styled.a``;

type Props = {
  // root message that contains a mutilingual anchor link
  mainMessage: Messages['key'];
  mainMessageLinkKey?: string; // key to be replaced by link, defaults to 'link'
  // the rest of the values for the keys present in the message
  mainMessageValues?: OriginalFormattedMessage.Props['values'];

  // message representing the url
  urlMessage: Messages['key'];
  urlMessageValues?: { [key: string]: MessageValue };

  // message representing the text inside the link, clickable part.
  linkTextMessage: Messages['key'];
  linkTextMessageValues?: OriginalFormattedMessage.Props['values'];

  // handy anchor Props
  target?: string;
};

const FormattedAnchor = memo(
  ({
    mainMessage,
    mainMessageLinkKey,
    mainMessageValues,
    urlMessage,
    urlMessageValues,
    linkTextMessage,
    linkTextMessageValues,
    intl: { formatMessage },
    target,
  }: Props & InjectedIntlProps) => {
    const allValues = mainMessageValues ? { ...mainMessageValues } : {};
    allValues[mainMessageLinkKey || 'link'] = (
      <Anchor
        href={formatMessage(urlMessage, urlMessageValues)}
        target={target}
      >
        <FormattedMessage {...linkTextMessage} values={linkTextMessageValues} />
      </Anchor>
    );
    return <FormattedMessage {...mainMessage} values={allValues} />;
  }
);

export default injectIntl(FormattedAnchor);
