import React from 'react';

import { FormProvider, useForm } from 'react-hook-form';

import { render, screen, userEvent, waitFor } from 'utils/testUtils/rtl';

import SingleFileUploadField from './SingleFileUploadField';

// Anonymous survey respondents have no idea id, so no remote files are fetched.
jest.mock('api/idea_files/useIdeaFiles', () => () => ({ data: undefined }));
jest.mock('api/idea_files/useDeleteIdeaFile', () => () => ({
  mutate: jest.fn(),
}));

const FIELD = 'my_file';

let latestValues: Record<string, unknown> = {};

const Wrapper = () => {
  const methods = useForm({
    defaultValues: {
      [FIELD]: {
        content: 'data:image/png;base64,AAAA',
        name: 'too-big.png',
        id: null,
      },
    },
  });

  latestValues = methods.watch();

  return (
    <FormProvider {...methods}>
      <SingleFileUploadField name={FIELD} />
    </FormProvider>
  );
};

describe('SingleFileUploadField', () => {
  // Regression test: the field previously read its value with `getValues`,
  // which does not subscribe to form state. Clearing the field in onFileRemove
  // updated React Hook Form but rendered nothing, so the removed file stayed on
  // screen and only disappeared once an unrelated re-render happened — the user
  // had to click the trash icon twice, and a file they believed was gone was
  // still submitted.
  it('removes the file from the UI and the form on a single click', async () => {
    const user = userEvent.setup();

    render(<Wrapper />);

    expect(await screen.findByText('too-big.png')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /remove this file/i }));

    await waitFor(() =>
      expect(screen.queryByText('too-big.png')).not.toBeInTheDocument()
    );
    expect(latestValues[FIELD]).toBeFalsy();
  });
});
