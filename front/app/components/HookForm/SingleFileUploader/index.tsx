import React from 'react';
import { get } from 'lodash-es';

// components
import { Box } from '@citizenlab/cl2-component-library';
import SingleFileInput from 'components/UI/SingleFileUploader/FileInput';
import FileDisplay from 'components/UI/SingleFileUploader/FileDisplay';
import Error from 'components/UI/Error';

// form
import { Controller, useFormContext } from 'react-hook-form';

// style
import { ScreenReaderOnly } from 'utils/a11y';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from 'components/UI/FileUploader/messages';

export interface Props {
  name: string;
}

const SingleFileUploader = ({ name }: Props) => {
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
