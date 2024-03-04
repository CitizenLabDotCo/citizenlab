import React, { useState, useEffect } from 'react';

import { Label } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { UploadFile } from 'typings';

import { Section, SectionField } from 'components/admin/Section';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import ImagesDropzone from 'components/UI/ImagesDropzone';

import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import getSubmitState from 'utils/getSubmitState';
import { isNilOrError } from 'utils/helperUtils';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useUpdateAppConfiguration from 'api/app_configuration/useUpdateAppConfiguration';

import messages from './messages';

const MainDropzone = styled(ImagesDropzone)`
  margin-top: 20px;
`;

const Preview = styled(ImagesDropzone)`
  margin-top: 20px;

  .remove-button {
    display: none;
  }

  * {
    border-radius: 0;
  }
`;

interface IAttributesDiff {
  favicon?: string;
}

const Favicon = () => {
  const { data: appConfiguration } = useAppConfiguration();
  const {
    mutate: updateAppConfiguration,
    isLoading,
    error,
    isSuccess,
  } = useUpdateAppConfiguration();

  const [attributesDiff, setAttributesDiff] = useState<IAttributesDiff>({});
  const [favicon, setFavicon] = useState<UploadFile[] | null>(null);

  useEffect(() => {
    if (appConfiguration) {
      if (
        appConfiguration.data.attributes.favicon &&
        appConfiguration.data.attributes.favicon.large
      ) {
        const url = appConfiguration.data.attributes.favicon.large;
        convertUrlToUploadFile(url, null, null).then((res) => {
          if (res) {
            setFavicon([res]);
          }
        });
      }
    }
  }, [appConfiguration]);

  const handleUploadOnAdd = (newImage: UploadFile[]) => {
    setAttributesDiff({ favicon: newImage[0].base64 });
    setFavicon([newImage[0]]);
  };

  const handleUploadOnRemove = () => {
    setAttributesDiff({});
    setFavicon(null);
  };

  const save = async (event) => {
    event.preventDefault();

    if (!isNilOrError(appConfiguration)) {
      updateAppConfiguration(attributesDiff);
    }
  };

  if (!isNilOrError(appConfiguration)) {
    return (
      <form onSubmit={save}>
        <Section>
          <SectionField key={'favicon'}>
            <Label>Favicon</Label>
            <FormattedMessage {...messages.faviconExplaination} />
            <MainDropzone
              acceptedFileTypes={{ 'image/*': ['.png'] }}
              images={favicon}
              imagePreviewRatio={1}
              maxImagePreviewWidth="152px"
              objectFit="contain"
              onAdd={handleUploadOnAdd}
              onRemove={handleUploadOnRemove}
              label="Drop file here"
            />
            <Preview
              acceptedFileTypes={{ 'image/*': ['.png'] }}
              images={favicon}
              imagePreviewRatio={1}
              maxImagePreviewWidth="32px"
              objectFit="contain"
              onAdd={handleUploadOnAdd}
              onRemove={handleUploadOnRemove}
              label=" "
            />
            <Preview
              acceptedFileTypes={{ 'image/*': ['.png'] }}
              images={favicon}
              imagePreviewRatio={1}
              maxImagePreviewWidth="16px"
              objectFit="contain"
              onAdd={handleUploadOnAdd}
              onRemove={handleUploadOnRemove}
              label=" "
            />
          </SectionField>
        </Section>

        <SubmitWrapper
          loading={isLoading}
          status={getSubmitState({
            errors: error,
            saved: isSuccess,
            diff: attributesDiff,
          })}
          messages={{
            buttonSave: messages.save,
            buttonSuccess: messages.saveSuccess,
            messageError: messages.saveErrorMessage,
            messageSuccess: messages.saveSuccessMessage,
          }}
        />
      </form>
    );
  }

  return null;
};

export default Favicon;
