import React, { memo } from 'react';
import { adopt } from 'react-adopt';
import styled from 'styled-components';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { get } from 'lodash-es';
import { truncate } from 'utils/textUtils';

// styles
import { fontSizes, colors, media } from 'utils/styleUtils';
import { darken } from 'polished';

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

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const HomeLink = styled(Link)``;

const HomeIcon = styled(Icon)`
  width: 16px;
  height: 14px;
  fill: ${colors.label};
  margin-top: -3px;

  &:hover {
    fill: ${darken(0.2, colors.label)};
  }
`;

const Separator = styled.div`
  margin: 0 15px;
  font-size: ${fontSizes.large}px;
  line-height: normal;
`;

const ProjectLink = styled(Link)`
  font-size: ${fontSizes.small}px;
  color: ${colors.label};

  &:hover {
    color: ${darken(0.2, colors.label)};
  }
`;

const LinkText = styled.span`
  ${media.largePhone`
    display: none;
  `}
`;

const TruncatedLinkText = styled.span`
  display: none;

  ${media.largePhone`
    display: inline;
  `}
`;

interface DataProps {
  idea: GetIdeaChildProps;
  project: GetProjectChildProps;
}

interface InputProps {
  ideaId: string;
}

interface Props extends DataProps, InputProps {}

const Breadcrumbs = memo(({ project, localize, intl }: Props & InjectedLocalized & InjectedIntlProps) => {

  if (!isNilOrError(project)) {
    return (
      <Container>
        <HomeLink to="/">
          <HomeIcon title={intl.formatMessage(messages.linkToHomePage)} name="homeFilled" />
        </HomeLink>
        <Separator>/</Separator>
        <ProjectLink id="e2e-project-link" to={`/projects/${project.attributes.slug}`}>
          {/* If we're on a small screen, we show a truncated version of the project */}
          <LinkText>{localize(project.attributes.title_multiloc)}</LinkText>
          <TruncatedLinkText>
            {truncate(localize(project.attributes.title_multiloc), 28)}
          </TruncatedLinkText>
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
