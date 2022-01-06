import React, { memo } from 'react';

// i18n
import localize, { InjectedLocalized } from 'utils/localize';
import { injectIntl, FormattedMessage, IMessageInfo } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// components
import { Icon } from '@citizenlab/cl2-component-library';
import Link from 'utils/cl-router/Link';

// styles
import styled from 'styled-components';
import { fontSizes, colors, media } from 'utils/styleUtils';
import { darken } from 'polished';

// typings
import { Multiloc } from 'typings';

const Container = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
`;

const HomeLink = styled(Link)`
  width: 16px;
`;

const HomeIcon = styled(Icon)`
  flex: 0 0 14px;
  height: 14px;
  fill: ${colors.label};
  margin-top: -3px;

  &:hover {
    fill: ${darken(0.25, colors.label)};
  }
`;

const Separator = styled.div`
  margin: 0 15px;
  font-size: ${fontSizes.large}px;
  font-weight: 300;
  line-height: normal;

  ${media.smallerThanMaxTablet`
    margin: 0 10px;
  `}
`;

const StyledLink = styled(Link)`
  font-size: ${fontSizes.small}px;
  color: ${colors.label};
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    color: ${darken(0.2, colors.label)};
    text-decoration: underline;
  }
`;

const LinkText = styled.span``;

interface ILink {
  to: string;
  text: Multiloc | IMessageInfo;
}

function isIMessageInfo(text: IMessageInfo | Multiloc): text is IMessageInfo {
  return (text as IMessageInfo).message !== undefined;
}

interface Props {
  className?: string;
  links: ILink[];
  postType: 'idea' | 'initiative';
}

const Breadcrumbs = memo(
  ({
    localize,
    intl,
    className,
    links,
    postType,
  }: Props & InjectedLocalized & InjectedIntlProps) => {
    return (
      <Container className={className}>
        <HomeLink id="e2e-home-page-link" to="/">
          <HomeIcon
            title={intl.formatMessage(messages.linkToHomePage)}
            name="homeFilled"
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
                <FormattedMessage
                  {...link.text.message}
                  values={link.text.values}
                />
              ) : (
                localize(link.text)
              )}
            </LinkText>
          </StyledLink>
        ))}
      </Container>
    );
  }
);

export default injectIntl(localize<Props & InjectedIntlProps>(Breadcrumbs));
