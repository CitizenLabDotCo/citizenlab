import React from 'react';

import {
  Icon,
  fontSizes,
  colors,
  media,
} from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
import { WrappedComponentProps } from 'react-intl';
import { RouteType } from 'routes';
import styled from 'styled-components';
import { Multiloc } from 'typings';

import useLocalize from 'hooks/useLocalize';

import { injectIntl, FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from './messages';

const Container = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
`;

const HomeLink = styled(Link)`
  width: 16px;
`;

const HomeIcon = styled(Icon)`
  flex: 0 0 24px;
  fill: ${colors.textSecondary};
  margin-top: -3px;

  &:hover {
    fill: ${darken(0.25, colors.textSecondary)};
  }
`;

const Separator = styled.div`
  margin: 0 15px;
  font-size: ${fontSizes.l}px;
  font-weight: 300;
  line-height: normal;

  ${media.tablet`
    margin: 0 10px;
  `}
`;

const StyledLink = styled(Link)`
  font-size: ${fontSizes.s}px;
  color: ${colors.textSecondary};
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    color: ${darken(0.2, colors.textSecondary)};
    text-decoration: underline;
  }
`;

const LinkText = styled.span``;

type Message = { message: MessageDescriptor };

interface ILink {
  to: RouteType;
  text: Multiloc | Message;
}

function isIMessageInfo(text: Message | Multiloc): text is Message {
  return (text as Message).message !== undefined;
}

interface Props {
  className?: string;
  links: ILink[];
  postType: 'idea' | 'initiative';
}

const Breadcrumbs = ({
  intl: { formatMessage },
  className,
  links,
  postType,
}: Props & WrappedComponentProps) => {
  const localize = useLocalize();

  return (
    <Container className={className}>
      <HomeLink id="e2e-home-page-link" to="/">
        <HomeIcon
          title={formatMessage(messages.linkToHomePage)}
          name="home"
          ariaHidden={false}
        />
      </HomeLink>
      <Separator>/</Separator>
      {links.map((link) => (
        <StyledLink
          key={link.to}
          id={`e2e-${postType}-other-link`}
          to={link.to}
        >
          <LinkText>
            {isIMessageInfo(link.text) ? (
              <FormattedMessage {...link.text.message} />
            ) : (
              localize(link.text)
            )}
          </LinkText>
        </StyledLink>
      ))}
    </Container>
  );
};

export default injectIntl(Breadcrumbs);
