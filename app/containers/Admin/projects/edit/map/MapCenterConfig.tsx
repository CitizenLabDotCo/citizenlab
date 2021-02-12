import React, { memo, useState, useEffect } from 'react';
import { isEmpty, inRange } from 'lodash-es';

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

const StyledInput = styled(Input)``;

const SaveButton = styled(Button)`
  margin-left: 10px;
`;

interface Props {
  projectId: string;
  className?: string;
}

interface IFormValues {
  center: string | null;
}

const getCenter = (mapConfig: IMapConfig) => {
  const lat = mapConfig?.attributes?.center_geojson?.coordinates?.[0];
  const long = mapConfig?.attributes?.center_geojson?.coordinates?.[1];

  if (lat && long) {
    return `${lat}, ${long}`;
  }

  return null;
};

const MapCenterConfig = memo<Props & InjectedIntlProps>(
  ({ projectId, className, intl: { formatMessage } }) => {
    const mapConfig = useMapConfig({ projectId });

    const [touched, setTouched] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: any }>({});
    const [formValues, setFormValues] = useState<IFormValues>({
      center: getCenter(mapConfig),
    });

    useEffect(() => {
      formChange(
        {
          center: getCenter(mapConfig),
        },
        false
      );
    }, [mapConfig]);

    const validate = () => {
      const latlong = formValues?.center?.split(',');

      if (latlong && latlong.length > 0) {
        const latitude = parseFloat(latlong[0]);
        const longitude = parseFloat(latlong[1]);

        if (inRange(longitude, -180, 180) && inRange(latitude, -90, 90)) {
          console.log('zolg');
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
              coordinates: [latitude, longitude],
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
        <SubSectionTitle>
          <FormattedMessage {...messages.centerLabel} />
        </SubSectionTitle>
        <InputWrapper>
          <StyledInput
            type="text"
            value={formValues.center}
            onChange={handleOnChange}
            placeholder="lat, lng (e.g. 50.87959, 4.70093)"
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
