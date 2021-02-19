import React, { memo, useState, useEffect } from 'react';
import { isEmpty, isNumber, inRange } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// services
import { updateProjectMapConfig } from 'services/mapConfigs';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useMapConfig from 'hooks/useMapConfig';

// components
import { Input } from 'cl2-component-library';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';

// utils
import { getZoomLevel } from 'utils/map';

// i18n
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
  width: 180px;
`;

const SaveButton = styled(Button)`
  margin-left: 8px;
`;

interface Props {
  projectId: string;
  className?: string;
}

interface IFormValues {
  zoom: number | null;
}

const MapZoomConfig = memo<Props & InjectedIntlProps>(
  ({ projectId, className, intl: { formatMessage } }) => {
    const appConfig = useAppConfiguration();
    const mapConfig = useMapConfig({ projectId });

    const [touched, setTouched] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: any }>({});
    const [formValues, setFormValues] = useState<IFormValues>({
      zoom: null,
    });

    useEffect(() => {
      if (!isNilOrError(appConfig) && mapConfig && formValues.zoom === null) {
        formChange(
          {
            zoom: getZoomLevel(undefined, appConfig, mapConfig),
          },
          false
        );
      }
    }, [appConfig, mapConfig, formValues]);

    const validate = () => {
      const newZoomLevel = parseInt(formValues.zoom as any, 10);

      if (isNumber(newZoomLevel) && inRange(newZoomLevel, 1, 18)) {
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
        <InputWrapper>
          <StyledInput
            type="number"
            value={formValues.zoom?.toString()}
            min="1"
            max="17"
            onChange={handleOnChange}
            label={formatMessage(messages.zoomLabel)}
            labelTooltipText={formatMessage(messages.zoomLabelTooltip)}
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
