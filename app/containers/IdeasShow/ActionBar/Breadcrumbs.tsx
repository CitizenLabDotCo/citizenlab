import React, { memo } from 'react';
import { adopt } from 'react-adopt';
import styled from 'styled-components';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { get } from 'lodash-es';

// styles
import { fontSizes, colors } from 'utils/styleUtils';
import { darken } from 'polished';

// i18n
import localize, { InjectedLocalized } from 'utils/localize';

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

interface DataProps {
  idea: GetIdeaChildProps;
  project: GetProjectChildProps;
}

interface InputProps {
  ideaId: string;
}

interface Props extends DataProps, InputProps {}

const Breadcrumbs = memo(({ project, localize }: Props & InjectedLocalized) => {

  if (!isNilOrError(project)) {
    return (
      <Container>
        <HomeLink to="/">
          <HomeIcon name="homeFilled" />
        </HomeLink>
        <Separator>/</Separator>
        <ProjectLink to={`/projects/${project.attributes.slug}`}>
          {localize(project.attributes.title_multiloc)}
        </ProjectLink>
      </Container>
    );
  }

  return null;
});

const BreadcrumbsWithHOCs = localize(Breadcrumbs);

const Data = adopt({
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  project: ({ idea, render }) => <GetProject id={get(idea, 'relationships.project.data.id')}>{render}</GetProject>,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <BreadcrumbsWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
