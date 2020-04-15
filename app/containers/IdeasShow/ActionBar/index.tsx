import React, { memo } from 'react';
import { adopt } from 'react-adopt';
import { get } from 'lodash-es';

// components
import BreadCrumbs from 'components/PostShowComponents/Breadcrumbs';
import ActionBarLayout from 'components/PostShowComponents/ActionBar';
import IdeaMoreActions from './IdeaMoreActions';

// resource
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  ideaId: string;
  onTranslateIdea: () => void;
  translateButtonClicked: boolean;
}

interface DataProps {
  idea: GetIdeaChildProps;
  authUser: GetAuthUserChildProps;
  locale: GetLocaleChildProps;
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps { }

const ActionBar = memo<Props>(({ project, onTranslateIdea, translateButtonClicked, idea, authUser, locale }) => {

  const showTranslateButton = (
    !isNilOrError(idea) &&
    !isNilOrError(locale) &&
    !idea.attributes.title_multiloc[locale]
  );

  const leftContent = !isNilOrError(project) ? (
    <BreadCrumbs
      postType="idea"
      links={[{
        text: project.attributes.title_multiloc,
        to: `/projects/${project.attributes.slug}`
      }]}
    />
  ) : null;

  const rightContent = !isNilOrError(authUser) && !isNilOrError(idea)
    ? <IdeaMoreActions idea={idea} hasLeftMargin={showTranslateButton} />
    : null;

  return (
    <ActionBarLayout
      leftContent={leftContent}
      rightContent={rightContent}
      showTranslateButton={showTranslateButton}
      onTranslate={onTranslateIdea}
      translateButtonClicked={translateButtonClicked}
    />
  );
});

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  authUser: <GetAuthUser />,
  idea: ({ ideaId, render }) => <GetIdea ideaId={ideaId}>{render}</GetIdea>,
  project: ({ idea, render }) => <GetProject projectId={get(idea, 'relationships.project.data.id')}>{render}</GetProject>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <ActionBar {...inputProps} {...dataProps} />}
  </Data>
);
