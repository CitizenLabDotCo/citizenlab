import React, { memo, useState, useEffect } from 'react';
import { isEmpty, inRange } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// services
import { updateProjectMapConfig } from '../../../services/mapConfigs';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useMapConfig from '../../../hooks/useMapConfig';

// components
import { Input, IconTooltip, Icon } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import { SubSectionTitle } from 'components/admin/Section';

// utils
import { getCenter, getZoomLevel } from '../../../utils/map';

// events
import {
  setLeafletMapCenter,
  setLeafletMapZoom,
} from 'components/UI/LeafletMap/events';

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
  margin-bottom: 25px;
`;

const StyledSubSectionTitle = styled(SubSectionTitle)`
  padding: 0px;
  margin: 0px;
`;

const StyledIconTooltip = styled(IconTooltip)`
  margin-left: 5px;
`;

const CopyIcon = styled(Icon)`
  width: 16px;
  height: 16px;
  fill: #fff;
  margin-left: 2px;
  margin-right: 2px;
`;

const CenterLatInput = styled(Input)`
  margin-bottom: 30px;
`;

const CenterLngInput = styled(Input)`
  margin-bottom: 30px;
`;

const ZoomInput = styled(Input)`
  margin-bottom: 25px;
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

    const [touched, setTouched] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: any }>({});
    const [formValues, setFormValues] = useState<IFormValues>({
      defaultZoom,
      defaultLat: defaultLat.toString(),
      defaultLng: defaultLng.toString(),
    });

    useEffect(() => {
      if (!isNilOrError(appConfig) && mapConfig) {
        const defaultLatLng = getCenter(undefined, appConfig, mapConfig);
        const defaultLat = defaultLatLng[0];
        const defaultLng = defaultLatLng[1];
        const defaultZoom = getZoomLevel(undefined, appConfig, mapConfig);

        formChange(
          {
            defaultZoom,
            defaultLat: defaultLat.toString(),
            defaultLng: defaultLng.toString(),
          },
          false
        );
      }
    }, [appConfig, mapConfig]);

    const validate = () => {
      const defaultLat = parseFloat(formValues.defaultLat as any);
      const defaultLng = parseFloat(formValues.defaultLng as any);
      const defaultZoom = parseInt(formValues.defaultZoom as any, 10);

      if (
        inRange(defaultLng, -180, 180) &&
        inRange(defaultLat, -90, 90) &&
        inRange(defaultZoom, 0, 21)
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
          const defaultZoom = formValues.defaultZoom?.toString() as string;

          await updateProjectMapConfig(projectId, mapConfig.id, {
            center_geojson: {
              type: 'Point',
              coordinates: [defaultLng, defaultLat],
            },
            zoom_level: defaultZoom,
          });

          setLeafletMapCenter([defaultLat, defaultLng]);
          setLeafletMapZoom(parseInt(defaultZoom, 10));
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
            <FormattedMessage {...messages.mapCenterAndZoom} />
            <StyledIconTooltip
              content={
                <FormattedMessage
                  {...messages.mapCenterAndZoomTooltip}
                  values={{ button: <CopyIcon title="save" name="save" /> }}
                />
              }
            />
          </StyledSubSectionTitle>
        </SubSectionTitleWrapper>

        <CenterLatInput
          type="text"
          value={formValues.defaultLat}
          onChange={handleCenterLatOnChange}
          label={formatMessage(messages.latLabel)}
          // label="Latitude"
          labelTooltipText={formatMessage(messages.centerLatLabelTooltip)}
        />

        <CenterLngInput
          type="text"
          value={formValues.defaultLng}
          onChange={handleCenterLngOnChange}
          label={formatMessage(messages.lngLabel)}
          // label="Longitude"
          labelTooltipText={formatMessage(messages.centerLngLabelTooltip)}
        />

        <ZoomInput
          type="number"
          value={formValues.defaultZoom?.toString()}
          min="1"
          max="18"
          onChange={handleZoomOnChange}
          label={formatMessage(messages.zoomLabel)}
          labelTooltipText={formatMessage(messages.zoomLabelTooltip)}
        />

        <ButtonWrapper>
          <SaveButton
            icon="save"
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
