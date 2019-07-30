import React, { memo } from 'react';

// i18n
import localize, { InjectedLocalized } from 'utils/localize';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// components
import Icon from 'components/UI/Icon';
import Link from 'utils/cl-router/Link';

// styles
import styled from 'styled-components';
import { fontSizes, colors, media, postPageContentMaxWidth } from 'utils/styleUtils';
import { darken } from 'polished';

import { Multiloc } from 'typings';

const Container = styled.div`
  width: calc(${postPageContentMaxWidth} - 400px);
  display: flex;
  align-items: center;

  ${media.smallerThan1200px`
    width: calc(100vw - 400px);
  `}

  ${media.smallerThanMaxTablet`
    width: calc(100vw - 300px);
  `}

  ${media.smallerThanMinTablet`
    width: calc(100vw - 100px);
  `}
`;

const HomeLink = styled(Link)`
  width: 16px;
`;

const HomeIcon = styled(Icon)`
  width: 100%;
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

interface Props {
  className?: string;
  linkTo: string;
  linkText: Multiloc | string;
}

const Breadcrumbs = memo(({ localize, intl, className, linkTo, linkText }: Props & InjectedLocalized & InjectedIntlProps) => {

    return (
      <Container className={className}>
        <HomeLink id="e2e-home-page-link" to="/">
          <HomeIcon title={intl.formatMessage(messages.linkToHomePage)} name="homeFilled" />
        </HomeLink>
        <Separator>/</Separator>
        <StyledLink id="e2e-other-link" to={linkTo}>
          <LinkText>{typeof linkText === 'string' ? linkText : localize(linkText)}</LinkText>
        </StyledLink>
      </Container>
    );
});

export default injectIntl(localize<Props & InjectedIntlProps>(Breadcrumbs));
