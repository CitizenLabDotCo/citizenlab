import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';
import { Controller, useFormContext } from 'react-hook-form';

import Error from 'components/UI/Error';
import messages from 'components/UI/FileUploader/messages';
import FileDisplay from 'components/UI/SingleFileUploader/FileDisplay';
import SingleFileInput from 'components/UI/SingleFileUploader/FileInput';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';

export interface Props {
  name: string;
  accept?: string;
}

const SingleFileUploader = ({ name, accept }: Props) => {
  const {
    setValue,
    formState: { errors },
    control,
    trigger,
  } = useFormContext();

  const errorMessage = get(errors, name)?.message as string | undefined;

  return (
    <>
      <Controller
        name={name}
        control={control}
        defaultValue={undefined}
        render={({ field: { ref: _ref, ...field } }) => {
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          const fileName = field?.value?.filename;

          return (
            <>
              {!fileName && (
                <Box mt="0px">
                  <SingleFileInput
                    id={name}
                    onAdd={(file) => {
                      setValue(name, file);
                      trigger(name);
                    }}
                    accept={accept}
                  />
                </Box>
              )}
              {fileName && (
                <FileDisplay
                  key={fileName}
                  onDeleteClick={() => {
                    setValue(name, undefined);
                    trigger(name);
                  }}
                  fileName={fileName}
                />
              )}

              <ScreenReaderOnly aria-live="polite">
                <FormattedMessage
                  {...(fileName
                    ? messages.a11y_filesToBeUploaded
                    : messages.a11y_noFiles)}
                  values={{ fileNames: fileName }}
                />
              </ScreenReaderOnly>
            </>
          );
        }}
      />
      {errorMessage && (
        <Error
          marginTop="8px"
          marginBottom="8px"
          text={errorMessage}
          scrollIntoView={false}
        />
      )}
    </>
  );
};

export default SingleFileUploader;
