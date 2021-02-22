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
import { SubSectionTitle } from 'components/admin/Section';

// utils
import { getCenter, getZoomLevel } from 'utils/map';

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

const SubSectionTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const StyledSubSectionTitle = styled(SubSectionTitle)`
  padding: 0px;
  margin: 0px;
`;

const CenterLatInput = styled(Input)`
  margin-bottom: 30px;
`;

const CenterLngInput = styled(Input)`
  margin-bottom: 30px;
`;

const ZoomInput = styled(Input)`
  margin-bottom: 30px;
`;

const ButtonWrapper = styled.div`
  display: flex;
`;

const SaveButton = styled(Button)`
  margin-right: 10px;
`;

interface Props {
  projectId: string;
  className?: string;
}

interface IFormValues {
  defaultLat: string | null;
  defaultLng: string | null;
  defaultZoom: number | null;
}

const MapCenterAndZoomConfig = memo<Props & InjectedIntlProps>(
  ({ projectId, className, intl: { formatMessage } }) => {
    const appConfig = useAppConfiguration();
    const mapConfig = useMapConfig({ projectId });

    const defaultLatLng = getCenter(undefined, appConfig, mapConfig);
    const defaultLat = defaultLatLng[0];
    const defaultLng = defaultLatLng[1];
    const defaultZoom = getZoomLevel(undefined, appConfig, mapConfig);

    const [isInit, setIsInit] = useState(false);
    const [touched, setTouched] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: any }>({});
    const [formValues, setFormValues] = useState<IFormValues>({
      defaultLat,
      defaultLng,
      defaultZoom,
    });

    useEffect(() => {
      if (!isNilOrError(appConfig) && mapConfig && !isInit) {
        const defaultLatLng = getCenter(undefined, appConfig, mapConfig);
        const defaultLat = defaultLatLng[0];
        const defaultLng = defaultLatLng[1];
        const defaultZoom = getZoomLevel(undefined, appConfig, mapConfig);

        formChange(
          {
            defaultLat,
            defaultLng,
            defaultZoom,
          },
          false
        );
        setIsInit(true);
      }
    }, [appConfig, mapConfig, isInit]);

    const validate = () => {
      const defaultLat = parseFloat(formValues.defaultLat as any);
      const defaultLng = parseFloat(formValues.defaultLng as any);
      const defaultZoom = parseInt(formValues.defaultZoom as any, 10);

      if (
        inRange(defaultLng, -180, 180) &&
        inRange(defaultLat, -90, 90) &&
        inRange(defaultZoom, 0, 18)
      ) {
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

    const handleCenterLatOnChange = (centerLat: string) => {
      formChange({ defaultLat: centerLat });
    };

    const handleCenterLngOnChange = (centerLng: string) => {
      formChange({ defaultLng: centerLng });
    };

    const handleZoomOnChange = (zoom: string) => {
      formChange({ defaultZoom: parseInt(zoom, 10) });
    };

    const handleOnSave = async (event: React.FormEvent) => {
      event.preventDefault();
      if (mapConfig && validate()) {
        try {
          formProcessing();
          const defaultLat = parseFloat(formValues.defaultLat as any);
          const defaultLng = parseFloat(formValues.defaultLng as any);
          const defaultZoom = formValues.defaultZoom?.toString();

          await updateProjectMapConfig(projectId, mapConfig.id, {
            center_geojson: {
              type: 'Point',
              coordinates: [defaultLng, defaultLat],
            },
            zoom_level: defaultZoom,
          });
          formSuccess();
        } catch (error) {
          formError(error);
        }
      }
    };

    return (
      <Container className={className || ''}>
        <SubSectionTitleWrapper>
          <StyledSubSectionTitle>
            <FormattedMessage {...messages.mapDefaultCenterAndZoom} />
          </StyledSubSectionTitle>
        </SubSectionTitleWrapper>

        <CenterLatInput
          type="text"
          value={formValues.defaultLat}
          onChange={handleCenterLatOnChange}
          label={formatMessage(messages.centerLatLabel)}
          labelTooltipText={formatMessage(messages.centerLatLabelTooltip)}
        />

        <CenterLngInput
          type="text"
          value={formValues.defaultLng}
          onChange={handleCenterLngOnChange}
          label={formatMessage(messages.centerLngLabel)}
          labelTooltipText={formatMessage(messages.centerLngLabelTooltip)}
        />

        <ZoomInput
          type="number"
          value={formValues.defaultZoom?.toString()}
          min="1"
          max="17"
          onChange={handleZoomOnChange}
          label={formatMessage(messages.zoomLabel)}
          labelTooltipText={formatMessage(messages.zoomLabelTooltip)}
        />

        <ButtonWrapper>
          <SaveButton
            buttonStyle="admin-dark"
            onClick={handleOnSave}
            processing={processing}
            disabled={!touched}
          >
            <FormattedMessage {...messages.save} />
          </SaveButton>
        </ButtonWrapper>

        {!isEmpty(errors) && (
          <Error text={formatMessage(messages.errorMessage)} marginTop="20px" />
        )}
      </Container>
    );
  }
);

export default injectIntl(MapCenterAndZoomConfig);
