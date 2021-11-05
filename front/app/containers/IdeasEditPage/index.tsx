import React, { useContext, useEffect } from 'react';
import { PreviousPathnameContext } from 'context';

import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';

import { isNilOrError } from 'utils/helperUtils';
import useAuthUser from 'hooks/useAuthUser';
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';
import useInputSchema from 'hooks/useInputSchema';
import { getInputTerm } from 'services/participationContexts';

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

import Form from 'components/Form';
import PageContainer from 'components/UI/PageContainer';
import IdeasEditMeta from './IdeasEditMeta';
import styled from 'styled-components';
import { fontSizes, media } from 'utils/styleUtils';
import useIdea from 'hooks/useIdea';
import { hasPermission } from 'services/permissions';

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

const IdeasEditPage = ({ params }: WithRouterProps) => {
  const authUser = useAuthUser();
  const project = useProject({ projectId: params.projectId });
  const phases = usePhases(params.projectId);
  const idea = useIdea({ ideaId: params.ideaId });
  const { schema, uiSchema } = useInputSchema(params.projectId);

  useEffect(() => {
    if (
      !isNilOrError(idea) &&
      !hasPermission({
        item: idea,
        action: 'edit',
        context: idea,
      })
    ) {
      const previousPathName = useContext(PreviousPathnameContext);
      clHistory.replace(previousPathName || (!authUser ? '/sign-up' : '/'));
    }
  }, [authUser, idea]);

  const onSubmit = (formData) => {
    console.log(formData);
  };

  if (!isNilOrError(project))
    return (
      <PageContainer>
        <IdeasEditMeta projectId={project.id} ideaId={params.ideaId} />
        <main>
          <Title>
            <FormattedMessage
              {...{
                idea: messages.formTitle,
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
          {!isNilOrError(idea) && (
            <Form
              schema={schema}
              uiSchema={uiSchema}
              onSubmit={onSubmit}
              initialFormData={idea.attributes}
            />
          )}
        </main>
      </PageContainer>
    );

  return null;
};

export default withRouter(IdeasEditPage);
