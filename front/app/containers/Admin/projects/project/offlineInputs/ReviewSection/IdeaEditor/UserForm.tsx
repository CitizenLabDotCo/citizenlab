import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// hook form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { string, object } from 'yup';
import Input from 'components/HookForm/Input';

// typings
import { IUser } from 'api/users/types';

interface FormData {
  email?: string;
  first_name?: string;
  last_name?: string;
}

interface Props {
  author: IUser;
}

const UserForm = ({ author }: Props) => {
  const { email, first_name, last_name } = author.data.attributes;

  const defaultValues: FormData = {
    email,
    first_name: first_name ?? undefined,
    last_name: last_name ?? undefined,
  };

  const schema = object({
    email: string().email(),
    first_name: string(),
    last_name: string(),
  });

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const handleSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)}>
        <Box mb="12px">
          <Input name="email" type="email" label="Email" />
        </Box>
        <Box mb="12px">
          <Input name="first_name" type="text" label="First name" />
        </Box>
        <Input name="last_name" type="text" label="Last name" />
      </form>
    </FormProvider>
  );
};

export default UserForm;
