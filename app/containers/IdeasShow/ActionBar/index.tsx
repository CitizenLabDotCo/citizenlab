import React, { memo } from 'react';
import { adopt } from 'react-adopt';
import { get } from 'lodash-es';

// components
import BreadCrumbs from 'components/UI/Breadcrumbs';
import ActionBarLayout from 'components/UI/ActionBar';
import IdeaMoreActions from './IdeaMoreActions';

// resource
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  ideaId: string;
  onTranslateIdea: () => void;
  translateButtonClicked: boolean;
}

interface DataProps {
  idea: GetIdeaChildProps;
  locale: GetLocaleChildProps;
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps { }

const ActionBar = memo<Props>(({ project, onTranslateIdea, translateButtonClicked, idea, locale }) => {

  const showTranslateButton = (
    !isNilOrError(idea) &&
    !isNilOrError(locale) &&
    !idea.attributes.title_multiloc[locale]
  );

  return (
    <ActionBarLayout
      leftContent={!isNilOrError(project) ? (
        <BreadCrumbs
          linkTo={`/projects/${project.attributes.slug}`}
          linkText={project.attributes.title_multiloc}
        />
      ) : null}
      rightContent={isNilOrError(idea)
        ? null
        : <IdeaMoreActions id="e2e-idea-more-actions" idea={idea} />}
      showTranslateButton={showTranslateButton}
      onTranslate={onTranslateIdea}
      translateButtonClicked={translateButtonClicked}
    />
  );
});

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  project: ({ idea, render }) => <GetProject id={get(idea, 'relationships.project.data.id')}>{render}</GetProject>,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <ActionBar {...inputProps} {...dataProps} />}
  </Data>
);
