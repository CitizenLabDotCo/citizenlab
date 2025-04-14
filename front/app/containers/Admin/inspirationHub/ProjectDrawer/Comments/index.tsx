import React from 'react';

import {
  Box,
  Title,
  Button,
  fontSizes,
  colors,
} from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import styled from 'styled-components';
import { string, object } from 'yup';

import useAuthUser from 'api/me/useAuthUser';
import useAddProjectLibraryExternalComment from 'api/project_library_external_comments/useAddProjectLibraryExternalComment';
import useProjectLibraryExternalComments from 'api/project_library_external_comments/useProjectLibraryExternalComments';

import TextArea from 'components/HookForm/TextArea';

import { useIntl } from 'utils/cl-intl';

import Comment from './Comment';
import getAuthorNames from './getAuthorNames';
import messages from './messages';

const StyledTextArea = styled(TextArea)`
  font-size: ${fontSizes.base}px;

  &:focus {
    outline: 1px solid ${colors.primary};
  }
`;

const schema = object({
  comment_body: string(),
});

type FormValues = {
  comment_body: string;
};

interface Props {
  projectId: string;
}

const Comments = ({ projectId }: Props) => {
  const { data: authUser } = useAuthUser();
  const { mutate: addExternalComment } = useAddProjectLibraryExternalComment();
  const { data: comments } = useProjectLibraryExternalComments({
    projectId,
    'page[size]': 100, // just a high number since we don't have pagination
  });

  const methods = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues: {
      comment_body: '',
    },
    resolver: yupResolver(schema),
  });

  const { formatMessage } = useIntl();

  if (!authUser) return null;

  const onFormSubmit = ({ comment_body }: FormValues) => {
    addExternalComment(
      {
        projectId,
        externalCommentReqBody: {
          body: comment_body,
          ...getAuthorNames(authUser),
        },
      },
      {
        onSuccess: () => {
          methods.reset();
        },
      }
    );
  };

  return (
    <>
      <Title variant="h3">Comments</Title>
      <FormProvider {...methods}>
        <form>
          <StyledTextArea
            rows={5}
            name="comment_body"
            placeholder={formatMessage(messages.writeYourCommentHere)}
          />
          <Box w="100%" mt="8px" display="flex">
            <Button
              w="auto"
              p="4px 8px"
              bgColor={colors.primary}
              onClick={methods.handleSubmit(onFormSubmit)}
              processing={methods.formState.isSubmitting}
            >
              {formatMessage(messages.postYourComment)}
            </Button>
          </Box>
        </form>
      </FormProvider>
      <Box mt="20px">
        {comments?.data.map((comment) => (
          <Comment key={comment.id} projectId={projectId} comment={comment} />
        ))}
      </Box>
    </>
  );
};

export default Comments;
