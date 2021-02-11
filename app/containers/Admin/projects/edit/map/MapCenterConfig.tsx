import React, { memo, useState, useEffect } from 'react';

// services
import { updateProjectMapLayer } from 'services/mapLayers';

// components
import { Input } from 'cl2-component-library';
import Button from 'components/UI/Button';

// i18n
// import T from 'components/T';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// styling
import styled from 'styled-components';

// typing
import { IMapLayerAttributes } from 'services/mapLayers';

const Container = styled.div``;

const CenterWrapper = styled.div`
  display: flex;
`;

interface Props {
  projectId: string;
  mapLayer: IMapLayerAttributes;
  className?: string;
}

interface IFormValues {
  center: string | null;
}

const MapCenterConfig = memo<Props & InjectedIntlProps>(
  ({ projectId, mapLayer, className, intl: { formatMessage } }) => {
    const [center, setCenter] = useState<string | null>(null);

    const [touched, setTouched] = useState(false);
    const [processing, setProcessing] = useState(false);
    // const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: any }>({});
    const [formValues, setFormValues] = useState<IFormValues>({
      center: null,
    });

    useEffect(() => {
      formChange(
        {
          center: null,
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

    const handleCenterOnChange = (center: string) => {
      console.log(center);
      setCenter(center);
    };

    const handleCenterOnSave = (event: React.FormEvent) => {
      event.preventDefault();
      // await updateProjectMapLayer(projectId, mapLayer.id, {
      //   title_multiloc,
      //   geojson,
      // });
    };

    return (
      <Container className={className || ''}>
        <CenterWrapper>
          <Input
            type="text"
            value={center}
            onChange={handleCenterOnChange}
            label={formatMessage(messages.centerLabel)}
          />
          <Button
            buttonStyle="admin-dark"
            onClick={handleCenterOnSave}
            processing={processing}
            disabled={!touched}
          >
            <FormattedMessage {...messages.save} />
          </Button>
        </CenterWrapper>
      </Container>
    );
  }
);

export default injectIntl(MapCenterConfig);
