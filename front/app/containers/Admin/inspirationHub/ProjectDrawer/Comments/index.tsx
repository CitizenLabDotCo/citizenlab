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

import TextArea from 'components/HookForm/TextArea';

import Comment from './Comment';

const StyledTextArea = styled(TextArea)`
  font-size: ${fontSizes.base}px;
  height: 40px;

  &:focus {
    outline: 1px solid ${colors.primary};
    height: auto;
  }
`;

const DUMMY_DATA = [
  {
    name: 'Michael Bluth',
    createdAt: '2021-08-10T12:00:00Z',
    badgeText: 'Go Vocal',
    badgeType: 'go-vocal',
  },
  {
    name: 'Tobias Funke',
    createdAt: '2021-08-10T12:00:00Z',
    badgeText: 'Vienna',
    badgeType: 'platform-moderator',
  },
  {
    name: 'George Michael Bluth',
    createdAt: '2021-08-10T12:00:00Z',
  },
] as const;

const schema = object({
  comment_body: string(),
});

type FormValues = {
  comment_body: string;
};

const Comments = () => {
  const methods = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues: {
      comment_body: '',
    },
    resolver: yupResolver(schema),
  });

  const onFormSubmit = (values: FormValues) => {
    console.log({ values });
  };

  return (
    <>
      <Title variant="h3">Comments</Title>
      <FormProvider {...methods}>
        <form>
          <StyledTextArea
            rows={5}
            name="comment_body"
            placeholder="Write your comment here"
          />
          <Box w="100%" mt="8px" display="flex">
            <Button
              w="auto"
              bgColor={colors.primary}
              onClick={methods.handleSubmit(onFormSubmit)}
              processing={methods.formState.isSubmitting}
            >
              Post your comment
            </Button>
          </Box>
        </form>
      </FormProvider>
      <Box mt="20px">
        {DUMMY_DATA.map((comment, i) => (
          <Comment {...comment} key={i} />
        ))}
      </Box>
    </>
  );
};

export default Comments;
