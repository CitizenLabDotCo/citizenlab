import React, { useContext, useEffect } from 'react';
import { PreviousPathnameContext } from 'context';

import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';

import { isAdmin, isModerator, isSuperAdmin } from 'services/permissions/roles';

import { isNilOrError } from 'utils/helperUtils';
import useAuthUser from 'hooks/useAuthUser';
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';
import useInputSchema from 'hooks/useInputSchema';
import { getInputTerm } from 'services/participationContexts';

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

import IdeasNewMeta from './IdeasNewMeta';
import Form from 'components/Form';

import styled from 'styled-components';
import { fontSizes, media } from 'utils/styleUtils';
import PageContainer from 'components/UI/PageContainer';

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

const IdeasNewPage = ({ params }: WithRouterProps) => {
  const authUser = useAuthUser();
  const project = useProject({ projectId: params.projectId });
  const phases = usePhases(params.projectId);
  const { schema, uiSchema } = useInputSchema(params.projectId);

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
      const previousPathName = useContext(PreviousPathnameContext);
      clHistory.replace(previousPathName || (!authUser ? '/sign-up' : '/'));
    }
  }, [authUser, project]);

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
  //
  //   });
  // }

  const onSubmit = (formData) => {
    console.log(formData);
  };

  if (!isNilOrError(project))
    return (
      <PageContainer>
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
                getInputTerm(project?.attributes.process_type, project, phases)
              ]}
            />
          </Title>
          <Form schema={schema} uiSchema={uiSchema} onSubmit={onSubmit} />
        </main>
      </PageContainer>
    );

  return null;
};

export default withRouter(IdeasNewPage);
