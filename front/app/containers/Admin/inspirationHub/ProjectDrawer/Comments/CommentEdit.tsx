import React from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { string, object } from 'yup';

import TextArea from 'components/HookForm/TextArea';

const schema = object({
  comment_body: string(),
});

type FormValues = {
  comment_body: string;
};

interface Props {
  body: string;
  onCancel: () => void;
}

const CommentEdit = ({ body, onCancel }: Props) => {
  const methods = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues: {
      comment_body: body,
    },
    resolver: yupResolver(schema),
  });

  return (
    <FormProvider {...methods}>
      <form>
        <TextArea name="comment_body" />
      </form>
      <Box w="auto" display="flex">
        <Button buttonStyle="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </Box>
    </FormProvider>
  );
};

export default CommentEdit;
