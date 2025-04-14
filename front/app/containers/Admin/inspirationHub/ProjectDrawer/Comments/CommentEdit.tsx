import React from 'react';

import { Box, Button, colors } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { string, object } from 'yup';

import useAuthUser from 'api/me/useAuthUser';
import useUpdateProjectLibraryExternalComment from 'api/project_library_external_comments/useUpdateProjectLibraryExternalComment';

import TextArea from 'components/HookForm/TextArea';

import { useIntl } from 'utils/cl-intl';

import getAuthorNames from './getAuthorNames';
import messages from './messages';

const schema = object({
  comment_body: string(),
});

type FormValues = {
  comment_body: string;
};

interface Props {
  projectId: string;
  commentId: string;
  body: string;
  onCancel: () => void;
}

const CommentEdit = ({ projectId, commentId, body, onCancel }: Props) => {
  const { mutate: updateComment, isLoading } =
    useUpdateProjectLibraryExternalComment();
  const { data: authUser } = useAuthUser();

  const methods = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues: {
      comment_body: body,
    },
    resolver: yupResolver(schema),
  });

  const { formatMessage } = useIntl();

  if (!authUser) return null;

  const onFormSubmit = ({ comment_body }: FormValues) => {
    updateComment(
      {
        projectId,
        externalCommentId: commentId,
        externalCommentReqBody: {
          ...getAuthorNames(authUser),
          body: comment_body,
        },
      },
      {
        onSuccess: onCancel,
      }
    );
  };

  return (
    <FormProvider {...methods}>
      <form>
        <TextArea name="comment_body" />
      </form>
      <Box w="auto" display="flex">
        <Button
          bgColor={colors.primary}
          p="4px 8px"
          mr="8px"
          processing={isLoading}
          onClick={methods.handleSubmit(onFormSubmit)}
        >
          {formatMessage(messages.save)}
        </Button>
        <Button buttonStyle="secondary" p="4px 8px" onClick={onCancel}>
          {formatMessage(messages.cancel)}
        </Button>
      </Box>
    </FormProvider>
  );
};

export default CommentEdit;
