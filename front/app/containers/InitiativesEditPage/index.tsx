import React, { useEffect, useState } from 'react';

// libraries
import clHistory from 'utils/cl-router/history';
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// services
import { isAdmin, isSuperAdmin, isModerator } from 'services/permissions/roles';
import { ITopicData } from 'services/topics';

// resources
import HasPermission from 'components/HasPermission';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetInitiative, {
  GetInitiativeChildProps,
} from 'resources/GetInitiative';
import { PreviousPathnameContext } from 'context';
import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import { useParams } from 'react-router-dom';
import useInitiativeFiles from 'api/initiative_files/useInitiativeFiles';
import useInitiativeImages from 'api/initiative_images/useInitiativeImages';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { convertUrlToUploadFile } from 'utils/fileUtils';

// components
import PageNotFound from 'components/PageNotFound';
import InitiativesEditMeta from './InitiativesEditMeta';
import InitiativesEditFormWrapper from './InitiativesEditFormWrapper';
import PageLayout from 'components/InitiativeForm/PageLayout';

// style
import { media } from 'utils/styleUtils';
import styled from 'styled-components';

// types
import { UploadFile } from 'typings';

const StyledInitiativesEditFormWrapper = styled(InitiativesEditFormWrapper)`
  width: 100%;
  min-width: 530px;
  height: 900px;
  ${media.tablet`
    min-width: 230px;
  `}
`;

interface DataProps {
  initiative: GetInitiativeChildProps;
  authUser: GetAuthUserChildProps;
  locale: GetLocaleChildProps;
  previousPathName: string | null;
  topics: GetTopicsChildProps;
}

interface Props extends DataProps {}

const InitiativesEditPage = ({
  previousPathName,
  initiative,
  authUser,
  locale,
  topics,
}: Props) => {
  const { initiativeId } = useParams() as {
    initiativeId: string;
  };
  const { data: initiativeFiles } = useInitiativeFiles(initiativeId);
  const { data: initiativeImages } = useInitiativeImages(initiativeId);
  const [files, setFiles] = useState<UploadFile[]>([]);

  useEffect(() => {
    async function getFiles() {
      let files: UploadFile[] = [];

      if (initiativeFiles) {
        files = (await Promise.all(
          initiativeFiles.data.map(async (file) => {
            const uploadFile = convertUrlToUploadFile(
              file.attributes.file.url,
              file.id,
              file.attributes.name
            );
            return uploadFile;
          })
        )) as UploadFile[];
      }
      setFiles(files);
    }

    getFiles();
  }, [initiativeFiles]);

  useEffect(() => {
    const isPrivilegedUser =
      !isNilOrError(authUser) &&
      (isAdmin({ data: authUser }) ||
        isModerator({ data: authUser }) ||
        isSuperAdmin({ data: authUser }));

    if (!isPrivilegedUser && authUser === null) {
      clHistory.replace(previousPathName || '/sign-up');
    }
  }, [authUser, previousPathName]);

  if (
    isNilOrError(authUser) ||
    isNilOrError(locale) ||
    isNilOrError(initiative) ||
    initiativeImages === undefined ||
    isNilOrError(topics)
  ) {
    return null;
  }

  const onPublished = () => {
    if (!isNilOrError(initiative)) {
      clHistory.push(`/initiatives/${initiative.attributes.slug}`);
    }
  };

  const initiativeTopics = topics.filter(
    (topic) => !isNilOrError(topic)
  ) as ITopicData[];
  return (
    <HasPermission item={initiative} action="edit" context={initiative}>
      <InitiativesEditMeta />
      <PageLayout
        isAdmin={isAdmin({ data: authUser })}
        className="e2e-initiative-edit-page"
      >
        <StyledInitiativesEditFormWrapper
          locale={locale}
          initiative={initiative}
          initiativeImage={
            isNilOrError(initiativeImages) || initiativeImages.data.length === 0
              ? null
              : initiativeImages.data[0]
          }
          onPublished={onPublished}
          initiativeFiles={files}
          topics={initiativeTopics}
        />
      </PageLayout>
    </HasPermission>
  );
};

const Data = adopt<DataProps, WithRouterProps>({
  authUser: <GetAuthUser />,
  locale: <GetLocale />,
  topics: <GetTopics excludeCode={'custom'} />,
  initiative: ({ params, render }) => (
    <GetInitiative id={params.initiativeId}>{render}</GetInitiative>
  ),
  previousPathName: ({ render }) => (
    <PreviousPathnameContext.Consumer>
      {render as any}
    </PreviousPathnameContext.Consumer>
  ),
});

export default withRouter((withRouterProps: WithRouterProps) => {
  const initiativesEnabled = useFeatureFlag({ name: 'initiatives' });

  if (!initiativesEnabled) {
    return <PageNotFound />;
  }

  return (
    <Data {...withRouterProps}>
      {(dataProps) => <InitiativesEditPage {...dataProps} />}
    </Data>
  );
});
