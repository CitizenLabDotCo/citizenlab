import React, { memo, useState, useEffect } from 'react';
import { isEmpty } from 'lodash-es';

// services
import { updateProjectMapLayer } from 'services/mapLayers';

// components
import { Input } from 'cl2-component-library';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';

// i18n
// import T from 'components/T';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// styling
import styled from 'styled-components';

// typing
import { IMapLayerAttributes } from 'services/mapLayers';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const InputWrapper = styled.div`
  display: flex;
`;

interface Props {
  projectId: string;
  mapLayer: IMapLayerAttributes;
  className?: string;
}

interface IFormValues {
  zoom: string | null;
}

const MapZoomConfig = memo<Props & InjectedIntlProps>(
  ({ projectId, mapLayer, className, intl: { formatMessage } }) => {
    const [touched, setTouched] = useState(false);
    const [processing, setProcessing] = useState(false);
    // const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: any }>({});
    const [formValues, setFormValues] = useState<IFormValues>({
      zoom: null,
    });

    useEffect(() => {
      formChange(
        {
          zoom: null,
        },
        false
      );
    }, [mapLayer]);

    const validate = () => {
      return true;
    };

    const formChange = (
      changedFormValue: Partial<IFormValues>,
      touched = true
    ) => {
      // setSuccess(false);
      setTouched(touched);
      setFormValues((prevFormValues) => ({
        ...prevFormValues,
        ...changedFormValue,
      }));
    };

    const formProcessing = () => {
      setProcessing(true);
      // setSuccess(false);
      setErrors({});
    };

    const formSuccess = () => {
      setProcessing(false);
      // setSuccess(true);
      setErrors({});
      setTouched(false);
    };

    const formError = (errorResponse) => {
      setProcessing(false);
      // setSuccess(false);
      setErrors(errorResponse?.json?.errors || 'unknown error');
    };

    const handleOnChange = (center: string) => {
      formChange({ zoom: center });
    };

    const handleOnSave = async (event: React.FormEvent) => {
      event.preventDefault();
      if (validate()) {
        try {
          formProcessing();
          // await updateProjectMapLayer(projectId, mapLayer.id, {
          //   title_multiloc,
          //   geojson,
          // });
          formSuccess();
        } catch (error) {
          formError(error);
        }
      }
    };

    return (
      <Container className={className || ''}>
        <InputWrapper>
          <Input
            type="text"
            value={formValues.zoom}
            onChange={handleOnChange}
            label={formatMessage(messages.centerLabel)}
          />
          <Button
            buttonStyle="admin-dark"
            onClick={handleOnSave}
            processing={processing}
            disabled={!touched}
          >
            <FormattedMessage {...messages.save} />
          </Button>
        </InputWrapper>
        {!isEmpty(errors) && (
          <Error
            text={formatMessage(messages.errorMessage)}
            showBackground={false}
            showIcon={false}
            marginTop="20px"
          />
        )}
      </Container>
    );
  }
);

export default injectIntl(MapZoomConfig);
