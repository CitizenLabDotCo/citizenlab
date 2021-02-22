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
import Tippy from '@tippyjs/react';
import { SubSectionTitle } from 'components/admin/Section';

// utils
import { getCenter, getZoomLevel } from 'utils/map';

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

const SubSectionTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 35px;
`;

const StyledSubSectionTitle = styled(SubSectionTitle)`
  padding: 0px;
  margin: 0px;
`;

const Buttons = styled.div`
  display: flex;
  align-items: center;
  display: none;
`;

const GetCenterAndZoomFromMapButton = styled(Button)``;

const SetCenterAndZoomOnMapButton = styled(Button)``;

const Spacer = styled.div`
  width: 10px;
`;

const CenterLatInput = styled(Input)``;

const CenterLngInput = styled(Input)``;

const ZoomInput = styled(Input)``;

const SaveButton = styled(Button)``;

interface Props {
  projectId: string;
  className?: string;
}

interface IFormValues {
  centerLat: string | null;
  centerLng: string | null;
  zoom: number | null;
}

const MapCenterAndZoomConfig = memo<Props & InjectedIntlProps>(
  ({ projectId, className, intl: { formatMessage } }) => {
    const appConfig = useAppConfiguration();
    const mapConfig = useMapConfig({ projectId });

    const centerCoordinates = getCenter(undefined, appConfig, mapConfig);
    const centerLat = centerCoordinates[0];
    const centerLng = centerCoordinates[1];
    const zoom = getZoomLevel(undefined, appConfig, mapConfig);

    const [isInitialised, setIsInitialised] = useState(false);
    const [touched, setTouched] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: any }>({});
    const [formValues, setFormValues] = useState<IFormValues>({
      centerLat,
      centerLng,
      zoom,
    });

    useEffect(() => {
      if (!isNilOrError(appConfig) && mapConfig && !isInitialised) {
        const centerCoordinates = getCenter(undefined, appConfig, mapConfig);
        const centerLat = centerCoordinates[0];
        const centerLng = centerCoordinates[1];
        const zoom = getZoomLevel(undefined, appConfig, mapConfig);

        formChange(
          {
            centerLat,
            centerLng,
            zoom,
          },
          false
        );
        setIsInitialised(true);
      }
    }, [appConfig, mapConfig, isInitialised]);

    const validate = () => {
      const centerLat = parseFloat(formValues.centerLat as any);
      const centerLng = parseFloat(formValues.centerLng as any);
      const zoom = parseInt(formValues.zoom as any, 10);

      if (
        inRange(centerLng, -180, 180) &&
        inRange(centerLat, -90, 90) &&
        inRange(zoom, 0, 18)
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
      formChange({ centerLat });
    };

    const handleCenterLngOnChange = (centerLng: string) => {
      formChange({ centerLng });
    };

    const handleZoomOnChange = (zoom: string) => {
      formChange({ zoom: parseInt(zoom, 10) });
    };

    const handleOnSave = async (event: React.FormEvent) => {
      event.preventDefault();
      if (mapConfig && validate()) {
        try {
          formProcessing();
          const centerLat = parseFloat(formValues.centerLat as any);
          const centerLng = parseFloat(formValues.centerLng as any);
          const zoom = formValues.zoom?.toString();

          await updateProjectMapConfig(projectId, mapConfig.id, {
            center_geojson: {
              type: 'Point',
              coordinates: [centerLng, centerLat],
            },
            zoom_level: zoom,
          });
          formSuccess();
        } catch (error) {
          formError(error);
        }
      }
    };

    const getCenterAndZoomFromMap = () => {
      // empty
    };

    const setCenterAndZoomOnMap = () => {
      // empty
    };

    return (
      <Container className={className || ''}>
        <SubSectionTitleWrapper>
          <StyledSubSectionTitle>
            <FormattedMessage {...messages.mapCenterAndZoom} />
          </StyledSubSectionTitle>

          <Buttons>
            <Tippy
              placement="bottom"
              content={'zolg'}
              hideOnClick={false}
              arrow={false}
            >
              <div>
                <GetCenterAndZoomFromMapButton
                  icon="saveAlt"
                  buttonStyle="secondary"
                  onClick={getCenterAndZoomFromMap}
                />
              </div>
            </Tippy>

            <Spacer />

            <Tippy
              placement="bottom"
              content={'zolg'}
              hideOnClick={false}
              arrow={false}
            >
              <div>
                <SetCenterAndZoomOnMapButton
                  icon="mapCenter"
                  buttonStyle="secondary"
                  onClick={setCenterAndZoomOnMap}
                />
              </div>
            </Tippy>
          </Buttons>
        </SubSectionTitleWrapper>

        <CenterLatInput
          type="text"
          value={formValues.centerLat}
          onChange={handleCenterLatOnChange}
          label={formatMessage(messages.centerLatLabel)}
        />

        <CenterLngInput
          type="text"
          value={formValues.centerLat}
          onChange={handleCenterLngOnChange}
          label={formatMessage(messages.centerLngLabel)}
        />

        <ZoomInput
          type="number"
          value={formValues.zoom?.toString()}
          min="1"
          max="17"
          onChange={handleZoomOnChange}
          label={formatMessage(messages.zoomLabel)}
          labelTooltipText={formatMessage(messages.zoomLabelTooltip)}
        />

        <SaveButton
          buttonStyle="admin-dark"
          onClick={handleOnSave}
          processing={processing}
          disabled={!touched}
        >
          <FormattedMessage {...messages.save} />
        </SaveButton>

        {isEmpty(errors) && (
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

export default injectIntl(MapCenterAndZoomConfig);
