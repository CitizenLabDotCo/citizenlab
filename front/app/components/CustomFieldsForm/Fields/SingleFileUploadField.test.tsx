import React from 'react';

import { FormProvider, useForm } from 'react-hook-form';

import {
  fireEvent,
  render,
  screen,
  userEvent,
  waitFor,
} from 'utils/testUtils/rtl';

import SingleFileUploadField, {
  MAX_FILE_SIZE_MB,
} from './SingleFileUploadField';

// Anonymous survey respondents have no idea id, so no remote files are fetched.
jest.mock('api/idea_files/useIdeaFiles', () => () => ({ data: undefined }));
jest.mock('api/idea_files/useDeleteIdeaFile', () => () => ({
  mutate: jest.fn(),
}));

const FIELD = 'my_file';

let latestValues: Record<string, unknown> = {};

const Wrapper = ({ withFile = true }: { withFile?: boolean }) => {
  const methods = useForm({
    defaultValues: {
      [FIELD]: withFile
        ? {
            content: 'data:image/png;base64,AAAA',
            name: 'too-big.png',
            id: null,
          }
        : null,
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
  // Regression test: reading the value with `getValues` meant removal didn't
  // re-render (two clicks needed), and clearing it with `undefined` didn't reach
  // the Controller, so a file the user had deleted was still submitted.
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

  // Anonymous respondents send nothing until the final submit, so without this
  // an oversized file is only rejected after the whole survey has been filled in.
  it('rejects an oversized file at selection without adding it to the form', async () => {
    render(<Wrapper withFile={false} />);

    const oversized = new File(['x'], 'huge.png', { type: 'image/png' });
    Object.defineProperty(oversized, 'size', {
      value: (MAX_FILE_SIZE_MB + 1) * 1000000,
    });

    // fireEvent rather than userEvent.upload: the input's onClick resets
    // `value` to null, which user-event's value tracking cannot handle.
    fireEvent.change(screen.getByTestId('fileInput'), {
      target: { files: [oversized] },
    });

    await waitFor(() =>
      expect(screen.getByText(/are not permitted/i)).toBeInTheDocument()
    );
    expect(screen.queryByText('huge.png')).not.toBeInTheDocument();
    expect(latestValues[FIELD]).toBeFalsy();
  });
});
