import React, { memo } from 'react';
import { adopt } from 'react-adopt';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { get } from 'lodash-es';

// i18n
import localize, { InjectedLocalized } from 'utils/localize';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

// components
import Icon from 'components/UI/Icon';
import Link from 'utils/cl-router/Link';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';

// styles
import styled from 'styled-components';
import { fontSizes, colors, media, postPageContentMaxWidth } from 'utils/styleUtils';
import { darken } from 'polished';

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

const ProjectLink = styled(Link)`
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

interface InputProps {
  ideaId: string;
  className?: string;
}

interface DataProps {
  idea: GetIdeaChildProps;
  project: GetProjectChildProps;
}

interface Props extends DataProps, InputProps {}

const Breadcrumbs = memo(({ project, localize, intl, className }: Props & InjectedLocalized & InjectedIntlProps) => {

  if (!isNilOrError(project)) {
    return (
      <Container className={className}>
        <HomeLink id="e2e-home-page-link" to="/">
          <HomeIcon title={intl.formatMessage(messages.linkToHomePage)} name="homeFilled" />
        </HomeLink>
        <Separator>/</Separator>
        <ProjectLink id="e2e-project-link" to={`/projects/${project.attributes.slug}`}>
          <LinkText>{localize(project.attributes.title_multiloc)}</LinkText>
        </ProjectLink>
      </Container>
    );
  }

  return null;
});

const BreadcrumbsWithHOCs = injectIntl(localize(Breadcrumbs));

const Data = adopt({
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  project: ({ idea, render }) => <GetProject id={get(idea, 'relationships.project.data.id')}>{render}</GetProject>,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <BreadcrumbsWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
