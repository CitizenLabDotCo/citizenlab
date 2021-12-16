import React, { useContext, useEffect } from 'react';
import { PreviousPathnameContext } from 'context';

import { WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';

import { isAdmin, isModerator, isSuperAdmin } from 'services/permissions/roles';

import { isError, isNilOrError } from 'utils/helperUtils';
import useAuthUser from 'hooks/useAuthUser';
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';
import useInputSchema from 'hooks/useInputSchema';
import { getInputTerm } from 'services/participationContexts';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

import IdeasNewMeta from '../IdeasNewMeta';
import Form from 'components/Form';

import styled from 'styled-components';
import { fontSizes, media } from 'utils/styleUtils';
import PageContainer from 'components/UI/PageContainer';
import { Box } from 'cl2-component-library';
import FullPageSpinner from 'components/UI/FullPageSpinner';
import { addIdea } from 'services/ideas';

// for getting inital state from previous page
// import { parse } from "qs";
// import { reverseGeocode } from "utils/locationTools";

// hopefully we can standardize this someday
const Title = styled.h1`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.xxxxl}px;
  line-height: 40px;
  font-weight: 500;
  text-align: center;
  margin: 0;
  padding: 0;
  padding-top: 60px;
  padding-bottom: 40px;

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.xxxl}px;
    line-height: 34px;
  `}
`;

const IdeasNewPageWithJSONForm = ({ params }: WithRouterProps) => {
  const previousPathName = useContext(PreviousPathnameContext);
  const authUser = useAuthUser();
  const project = useProject({ projectSlug: params.slug });

  const phases = usePhases(project?.id);
  const { schema, uiSchema } = useInputSchema(project?.id);

  useEffect(() => {
    const isPrivilegedUser =
      !isNilOrError(authUser) &&
      (isAdmin({ data: authUser }) ||
        isModerator({ data: authUser }) ||
        isSuperAdmin({ data: authUser }));

    if (
      !isPrivilegedUser &&
      (authUser === null ||
        (!isNilOrError(project) &&
          !project.attributes.action_descriptor.posting_idea.enabled))
    ) {
      clHistory.replace(previousPathName || (!authUser ? '/sign-up' : '/'));
    }
  }, [authUser, project, previousPathName]);

  // this will be useful to ge the initial form data (in case user clicked the map)
  // from the router's location into the form
  // although we might want to move this logic into the location picking component ?
  // const { lat, lng } = parse(location.search, {
  //   ignoreQueryPrefix: true,
  //   decoder: (str, _defaultEncoder, _charset, type) => {
  //     return type === 'value' ? parseFloat(str) : str;
  //   },
  // }) as { [key: string]: string | number };
  //
  // if (typeof lat === "number" && typeof lng === "number") {
  //   reverseGeocode(lat, lng).then((address) => {
  //   TODO
  //   });
  // }

  const onSubmit = async (data) => {
    const idea = await addIdea({
      ...data,
      project_id: project?.id,
      publication_status: 'published',
    });
    const ideaId = idea.data.id;

    // try { // TODO move img and file to main form wih b64 or implement
    // here or implement sending images and files through via the field so we can just use the id here
    //
    //   const imageToAddPromise =
    //     imageFile && imageFile[0]
    //       ? addIdeaImage(ideaId, imageFile[0].base64, 0)
    //       : Promise.resolve(null);
    //   const filesToAddPromises = ideaFiles.map((file) =>
    //     addIdeaFile(ideaId, file.base64, file.name)
    //   );
    //
    //   await Promise.all([
    //     imageToAddPromise,
    //     ...filesToAddPromises,
    //   ] as Promise<any>[]);
    // } catch (error) {
    //   const apiErrors = get(error, 'json.errors');
    //   // eslint-disable-next-line no-console
    //   if (process.env.NODE_ENV === 'development') console.log(error);
    //
    //   if (apiErrors && apiErrors.image) {
    //     this.globalState.set({
    //       fileOrImageError: true,
    //     });
    //   }
    // }
    //
    // const { fileOrImageError } = await this.globalState.get();
    // if (fileOrImageError) {
    //   setTimeout(() => {
    //     clHistory.push({
    //       pathname: `/ideas/${idea.data.attributes.slug}`,
    //       search: `?new_idea_id=${ideaId}`,
    //     });
    //   }, 4000);
    // } else {
    //   clHistory.push({
    //     pathname: `/ideas/${idea.data.attributes.slug}`,
    //     search: `?new_idea_id=${ideaId}`,
    //   });
    // }
    clHistory.push({
      pathname: `/ideas/${idea.data.attributes.slug}`,
      search: `?new_idea_id=${ideaId}`,
    });
  };

  return (
    <PageContainer>
      {!isNilOrError(project) ? (
        <>
          <IdeasNewMeta />
          <main>
            <Title>
              <FormattedMessage
                {...{
                  idea: messages.ideaFormTitle,
                  option: messages.optionFormTitle,
                  project: messages.projectFormTitle,
                  question: messages.questionFormTitle,
                  issue: messages.issueFormTitle,
                  contribution: messages.contributionFormTitle,
                }[
                  getInputTerm(
                    project?.attributes.process_type,
                    project,
                    phases
                  )
                ]}
              />
            </Title>
            <Form schema={schema} uiSchema={uiSchema} onSubmit={onSubmit} />
          </main>
        </>
      ) : isError(project) ? (
        <Box>Please try again</Box>
      ) : (
        <FullPageSpinner />
      )}
    </PageContainer>
  );
};

export default IdeasNewPageWithJSONForm;
