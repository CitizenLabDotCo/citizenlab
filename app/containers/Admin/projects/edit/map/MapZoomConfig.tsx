import React, { memo, useState, useEffect } from 'react';
import { isEmpty, isNumber, inRange } from 'lodash-es';

// services
import { updateProjectMapConfig } from 'services/mapConfigs';

// hooks
import useMapConfig, { IOutput as IMapConfig } from 'hooks/useMapConfig';

// components
import { Input } from 'cl2-component-library';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import { SubSectionTitle } from 'components/admin/Section';

// i18n
// import T from 'components/T';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// styling
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: flex-end;
`;

const StyledInput = styled(Input)`
  width: 100px;
`;

const SaveButton = styled(Button)`
  margin-left: 10px;
`;

interface Props {
  projectId: string;
  className?: string;
}

interface IFormValues {
  zoom: number | null;
}

const getZoom = (mapConfig: IMapConfig) => {
  if (mapConfig?.attributes?.zoom_level !== undefined) {
    const zoom = parseInt(mapConfig?.attributes?.zoom_level, 10);

    if (inRange(zoom, 0, 18)) {
      return zoom;
    }
  }

  return null;
};

const MapZoomConfig = memo<Props & InjectedIntlProps>(
  ({ projectId, className, intl: { formatMessage } }) => {
    const mapConfig = useMapConfig({ projectId });

    const [touched, setTouched] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: any }>({});
    const [formValues, setFormValues] = useState<IFormValues>({
      zoom: getZoom(mapConfig),
    });

    useEffect(() => {
      formChange(
        {
          zoom: getZoom(mapConfig),
        },
        false
      );
    }, [mapConfig]);

    const validate = () => {
      console.log(formValues.zoom);

      if (isNumber(formValues.zoom) && inRange(formValues.zoom, 0, 18)) {
        return true;
      }

      return false;
    };

    const formChange = (
      changedFormValue: Partial<IFormValues>,
      touched = true
    ) => {
      setTouched(touched);
      setFormValues((prevFormValues) => ({
        ...prevFormValues,
        ...changedFormValue,
      }));
    };

    const formProcessing = () => {
      setProcessing(true);
      setErrors({});
    };

    const formSuccess = () => {
      setProcessing(false);
      setErrors({});
      setTouched(false);
    };

    const formError = (errorResponse) => {
      setProcessing(false);
      setErrors(errorResponse?.json?.errors || 'unknown error');
    };

    const handleOnChange = (zoom: string) => {
      formChange({ zoom: parseInt(zoom, 10) });
    };

    const handleOnSave = async (event: React.FormEvent) => {
      event.preventDefault();
      if (mapConfig && validate()) {
        try {
          formProcessing();
          await updateProjectMapConfig(projectId, mapConfig.id, {
            zoom_level: `${formValues.zoom}`,
          });
          formSuccess();
        } catch (error) {
          formError(error);
        }
      }
    };

    return (
      <Container className={className || ''}>
        <SubSectionTitle>
          <FormattedMessage {...messages.zoomLabel} />
        </SubSectionTitle>
        <InputWrapper>
          <StyledInput
            type="number"
            value={formValues.zoom?.toString()}
            onChange={handleOnChange}
          />
          <SaveButton
            buttonStyle="admin-dark"
            onClick={handleOnSave}
            processing={processing}
            disabled={!touched}
            padding="12px 16px"
          >
            <FormattedMessage {...messages.save} />
          </SaveButton>
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
