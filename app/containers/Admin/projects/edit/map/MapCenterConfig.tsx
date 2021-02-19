import React, { memo, useState, useEffect } from 'react';
import { isEmpty, inRange } from 'lodash-es';
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
import { getCenter } from 'utils/map';

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

const StyledInput = styled(Input)``;

const SaveButton = styled(Button)`
  margin-left: 8px;
`;

interface Props {
  projectId: string;
  className?: string;
}

interface IFormValues {
  center: string | null;
}

const MapCenterConfig = memo<Props & InjectedIntlProps>(
  ({ projectId, className, intl: { formatMessage } }) => {
    const appConfig = useAppConfiguration();
    const mapConfig = useMapConfig({ projectId });

    const [touched, setTouched] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: any }>({});
    const [formValues, setFormValues] = useState<IFormValues>({
      center: null,
    });

    useEffect(() => {
      if (!isNilOrError(appConfig) && mapConfig && formValues.center === null) {
        const center = getCenter(undefined, appConfig, mapConfig);

        formChange(
          {
            center: `${center[0]}, ${center[1]}`,
          },
          false
        );
      }
    }, [appConfig, mapConfig, formValues]);

    const validate = () => {
      const latlong = formValues?.center?.split(',');

      if (latlong && latlong.length > 0) {
        const latitude = parseFloat(latlong[0]);
        const longitude = parseFloat(latlong[1]);

        if (inRange(longitude, -180, 180) && inRange(latitude, -90, 90)) {
          return true;
        }
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

    const handleOnChange = (center: string) => {
      formChange({ center });
    };

    const handleOnSave = async (event: React.FormEvent) => {
      event.preventDefault();
      if (
        mapConfig &&
        formValues.center &&
        formValues.center.length > 0 &&
        validate()
      ) {
        try {
          formProcessing();
          const latlong = formValues.center.split(',');
          const latitude = parseFloat(latlong[0]);
          const longitude = parseFloat(latlong[1]);
          await updateProjectMapConfig(projectId, mapConfig.id, {
            center_geojson: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
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
            type="text"
            value={formValues.center}
            onChange={handleOnChange}
            placeholder="lat, lng (e.g. 50.87959, 4.70093)"
            label={formatMessage(messages.centerLabel)}
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

export default injectIntl(MapCenterConfig);
