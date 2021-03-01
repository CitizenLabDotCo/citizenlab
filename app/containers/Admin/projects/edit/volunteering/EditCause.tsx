import React, { memo, useCallback, useState, useEffect } from 'react';
import { isEmpty } from 'lodash-es';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';
import { convertUrlToUploadFile } from 'utils/fileTools';

// Services
import { updateCause } from 'services/causes';
import useCause from 'hooks/useCause';

// Components
import {
  Section,
  SectionField,
  SectionTitle,
  SectionDescription,
} from 'components/admin/Section';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import { Label } from 'cl2-component-library';
import ImagesDropzone from 'components/UI/ImagesDropzone';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';

// Styling
import styled from 'styled-components';

// Typing
import { Multiloc, Locale, UploadFile } from 'typings';

const Container = styled.div``;

const ButtonContainer = styled.div`
  display: flex;
`;

interface Props {
  className?: string;
}

interface IFormValues {
  title_multiloc: Multiloc | null;
  description_multiloc: Multiloc | null;
  image: UploadFile | null;
}

const EditCause = memo<Props & InjectedIntlProps & WithRouterProps>((props) => {
  const {
    intl: { formatMessage },
  } = props;
  const causeId = props.params.causeId;
  const projectId = props.params.projectId;
  const cause = useCause({ causeId });

  const [touched, setTouched] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: any }>({});
  const [formValues, setFormValues] = useState<IFormValues>({
    title_multiloc: null,
    description_multiloc: null,
    image: null,
  });

  // Load the API cause object in the local form values
  useEffect(() => {
    if (!processing) {
      (async () => {
        if (!isNilOrError(cause)) {
          let image: UploadFile | null = null;
          if (cause.attributes.image?.large) {
            image = await convertUrlToUploadFile(cause.attributes.image.large);
          }
          setFormValues({
            image,
            title_multiloc: cause.attributes.title_multiloc,
            description_multiloc: cause.attributes.description_multiloc,
          });
        }
      })();
    }
  }, [cause]);

  const handleTitleOnChange = useCallback((title_multiloc: Multiloc) => {
    setTouched(true);
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      title_multiloc,
    }));
  }, []);

  const handleDescriptionOnChange = useCallback(
    (description_multiloc: Multiloc, _locale: Locale) => {
      setTouched(true);
      setFormValues((prevFormValues) => ({
        ...prevFormValues,
        description_multiloc,
      }));
    },
    []
  );

  const handleImageOnAdd = useCallback((images: UploadFile[]) => {
    setTouched(true);
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      image: images[0],
    }));
  }, []);

  const handleImageOnRemove = useCallback(() => {
    setTouched(true);
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      image: null,
    }));
  }, []);

  const handleOnSubmit = useCallback(() => {
    const { title_multiloc, description_multiloc, image } = formValues;

    if (!processing && title_multiloc && description_multiloc) {
      setProcessing(true);
      setErrors({});

      updateCause(causeId, {
        description_multiloc,
        title_multiloc,
        image: image?.base64,
      })
        .then(() => {
          setProcessing(false);
          setErrors({});
          setTouched(false);
          clHistory.push(`/admin/projects/${projectId}/volunteering`);
        })
        .catch((errorResponse) => {
          setProcessing(false);
          setErrors(errorResponse?.json?.errors || {});
        });
    }
  }, [formValues, processing]);

  return (
    <Container>
      <SectionTitle>
        <FormattedMessage {...messages.editCauseTitle} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.editCauseSubtitle} />
      </SectionDescription>

      <Section>
        <SectionField>
          <InputMultilocWithLocaleSwitcher
            type="text"
            id="cause-title"
            valueMultiloc={formValues.title_multiloc}
            onChange={handleTitleOnChange}
            label={formatMessage(messages.causeTitleLabel)}
          />
          <Error
            fieldName="title_multiloc"
            apiErrors={errors?.title_multiloc}
          />
        </SectionField>

        <SectionField>
          <QuillMultilocWithLocaleSwitcher
            id="cause-description"
            valueMultiloc={formValues.description_multiloc}
            onChange={handleDescriptionOnChange}
            label={formatMessage(messages.causeDescriptionLabel)}
            labelTooltipText={formatMessage(messages.causeDescriptionTooltip)}
            withCTAButton
          />
          <Error
            fieldName="description_multiloc"
            apiErrors={errors?.description_multiloc}
          />
        </SectionField>
        <SectionField>
          <Label>
            <FormattedMessage {...messages.causeImageLabel} />
          </Label>
          <ImagesDropzone
            acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
            maxNumberOfImages={1}
            maxImageFileSize={5000000}
            images={formValues.image ? [formValues.image] : null}
            imagePreviewRatio={120 / 480}
            maxImagePreviewWidth="500px"
            onAdd={handleImageOnAdd}
            onRemove={handleImageOnRemove}
          />
        </SectionField>
      </Section>

      <ButtonContainer>
        <Button
          buttonStyle="admin-dark"
          onClick={handleOnSubmit}
          processing={processing}
          disabled={!touched}
        >
          <FormattedMessage {...messages.saveCause} />
        </Button>

        {!isEmpty(errors) && (
          <Error
            text={formatMessage(messages.causeErrorMessage)}
            showBackground={false}
            showIcon={false}
          />
        )}
      </ButtonContainer>
    </Container>
  );
});

export default withRouter(injectIntl(EditCause));
