import React, { memo, useState, useEffect } from 'react';

import MapView from '@arcgis/core/views/MapView';
import { Input, IconTooltip, Icon } from '@citizenlab/cl2-component-library';
import { isEmpty, inRange } from 'lodash-es';
import { WrappedComponentProps } from 'react-intl';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IMapConfig } from 'api/map_config/types';
import useUpdateMapConfig from 'api/map_config/useUpdateMapConfig';

import { SubSectionTitle } from 'components/admin/Section';
import { goToMapLocation } from 'components/EsriMap/utils';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Error from 'components/UI/Error';

import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import { getCenter, getZoomLevel } from '../../../../utils/mapUtils/map';
import messages from '../messages';

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

const SaveButton = styled(ButtonWithLink)`
  margin-right: 10px;
`;

interface Props {
  className?: string;
  mapView?: MapView | null;
  mapConfig: IMapConfig;
}

interface IFormValues {
  defaultLat: string | null;
  defaultLng: string | null;
  defaultZoom: number | null;
}

const MapCenterAndZoomConfig = memo<Props & WrappedComponentProps>(
  ({ className, mapConfig, mapView, intl: { formatMessage } }) => {
    const { projectId } = useParams() as {
      projectId: string;
    };

    const { data: appConfig } = useAppConfiguration();
    const { mutateAsync: updateMapConfig } = useUpdateMapConfig(projectId);

    const defaultLatLng = getCenter(
      undefined,
      appConfig?.data,
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      mapConfig?.data
    );
    const defaultLat = defaultLatLng[0];
    const defaultLng = defaultLatLng[1];
    const defaultZoom = getZoomLevel(
      undefined,
      appConfig?.data,
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      mapConfig?.data
    );

    const [touched, setTouched] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: any }>({});
    const [formValues, setFormValues] = useState<IFormValues>({
      defaultZoom,
      defaultLat: defaultLat.toString(),
      defaultLng: defaultLng.toString(),
    });

    useEffect(() => {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!isNilOrError(appConfig) && mapConfig) {
        const defaultLatLng = getCenter(
          undefined,
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          appConfig?.data,
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          mapConfig?.data
        );
        const defaultLat = defaultLatLng[0];
        const defaultLng = defaultLatLng[1];
        const defaultZoom = getZoomLevel(
          undefined,
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          appConfig?.data,
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          mapConfig?.data
        );

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

      // Move map to new position
      if (
        mapView &&
        formValues.defaultLng &&
        formValues.defaultLat &&
        formValues.defaultZoom
      ) {
        goToMapLocation(
          {
            type: 'Point',
            coordinates: [
              parseFloat(formValues.defaultLng),
              parseFloat(formValues.defaultLat),
            ],
          },
          mapView,
          formValues.defaultZoom || undefined
        );
      }
    };

    const formError = (errorResponse) => {
      setProcessing(false);
      setErrors(errorResponse?.errors || 'unknown error');
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

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (mapConfig && validate()) {
        try {
          formProcessing();
          const defaultLat = parseFloat(formValues.defaultLat as any);
          const defaultLng = parseFloat(formValues.defaultLng as any);
          const defaultZoom = formValues.defaultZoom?.toString() as string;

          await updateMapConfig({
            mapConfigId: mapConfig.data.id,
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
          id="e2e-lat-input"
          type="text"
          value={formValues.defaultLat}
          onChange={handleCenterLatOnChange}
          label={formatMessage(messages.latLabel)}
          // label="Latitude"
          labelTooltipText={formatMessage(messages.centerLatLabelTooltip)}
        />

        <CenterLngInput
          id="e2e-long-input"
          type="text"
          value={formValues.defaultLng}
          onChange={handleCenterLngOnChange}
          label={formatMessage(messages.lngLabel)}
          // label="Longitude"
          labelTooltipText={formatMessage(messages.centerLngLabelTooltip)}
        />

        <ZoomInput
          id="e2e-zoom-input"
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
            data-cy="e2e-map-extent-save-btn"
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
          <Error
            id="e2e-map-config-error"
            text={formatMessage(messages.errorMessage)}
            marginTop="20px"
          />
        )}
      </Container>
    );
  }
);

export default injectIntl(MapCenterAndZoomConfig);
