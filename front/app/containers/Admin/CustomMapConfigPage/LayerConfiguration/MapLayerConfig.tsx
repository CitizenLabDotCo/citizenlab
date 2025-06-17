import React, { memo, useEffect, useState } from 'react';

import {
  ColorPickerInput,
  IOption,
  Select,
} from '@citizenlab/cl2-component-library';
import { isEmpty, cloneDeep, forOwn } from 'lodash-es';
import { WrappedComponentProps } from 'react-intl';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Multiloc } from 'typings';

import { IMapConfig } from 'api/map_config/types';
import { IMapLayerAttributes } from 'api/map_layers/types';
import useUpdateMapLayer from 'api/map_layers/useUpdateMapLayer';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import {
  Section,
  SectionField,
  SubSectionTitle,
} from 'components/admin/Section';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Error from 'components/UI/Error';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import {
  getLayerColor,
  makiIconNames,
  getUnnamedLayerTitleMultiloc,
  getGeojsonLayerType,
} from 'utils/mapUtils/map';

import messages from '../messages';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 60px;
`;

const StyledSection = styled(Section)`
  margin-bottom: 10px;
  padding-top: 25px;
  border-top: solid 1px #ccc;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 25px;
  border-bottom: solid 1px #ccc;
`;

const FooterLeft = styled.div`
  display: flex;
  align-items: center;
`;

const FooterRight = styled.div`
  display: flex;
  align-items: center;
  margin-left: 15px;
`;

const CancelButton = styled(ButtonWithLink)`
  margin-left: 10px;
`;

interface Props {
  mapLayerId: string;
  mapConfig: IMapConfig;
  className?: string;
  onClose: () => void;
}

interface IFormValues {
  title_multiloc: Multiloc | null;
  tooltipContent: Multiloc | null;
  color: string;
  markerSymbol: string;
}

const makiIconOptions: IOption[] = makiIconNames.map((makiIconName) => {
  return {
    value: makiIconName,
    label: makiIconName,
  };
});

const getEditableTitleMultiloc = (
  mapLayer: IMapLayerAttributes | undefined
) => {
  const mutiloc = {};

  if (mapLayer?.title_multiloc) {
    forOwn(mapLayer.title_multiloc, (value: string, key) => {
      mutiloc[key] = value === 'Unnamed layer' ? '' : value;
    });

    return mutiloc as Multiloc;
  }

  return null;
};

const MapLayerConfig = memo<Props & WrappedComponentProps>(
  ({ mapConfig, mapLayerId, className, onClose, intl: { formatMessage } }) => {
    const { projectId } = useParams() as { projectId: string };
    const { mutateAsync: updateProjectMapLayer } = useUpdateMapLayer(projectId);
    const tenantLocales = useAppConfigurationLocales();

    const mapLayer =
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      mapConfig?.data?.attributes?.layers?.find(
        (layer) => layer.id === mapLayerId
      ) || undefined;
    const geojsonDataType = getGeojsonLayerType(mapLayer);

    const [touched, setTouched] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: any }>({});
    const [formValues, setFormValues] = useState<IFormValues>({
      title_multiloc: getEditableTitleMultiloc(mapLayer),
      color: getLayerColor(mapLayer),
      markerSymbol:
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        mapLayer?.geojson?.features?.[0]?.properties?.['marker-symbol'] || '',
      tooltipContent:
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        mapLayer?.geojson?.features?.[0]?.properties?.tooltipContent,
    });

    useEffect(() => {
      formChange(
        {
          title_multiloc: getEditableTitleMultiloc(mapLayer),
          color: getLayerColor(mapLayer),
          markerSymbol:
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            mapLayer?.geojson?.features?.[0]?.properties?.['marker-symbol'] ||
            '',
          tooltipContent:
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            mapLayer?.geojson?.features?.[0]?.properties?.tooltipContent,
        },
        false
      );
    }, [mapLayer]);

    const handleTitleOnChange = (title_multiloc: Multiloc) => {
      formChange({ title_multiloc });
    };

    const handleTooltipContentOnChange = (tooltipContent: Multiloc) => {
      formChange({ tooltipContent });
    };

    const handleColorOnChange = (color: string) => {
      formChange({ color });
    };

    const handleMarkerSymbolOnChange = (option: IOption) => {
      formChange({ markerSymbol: option.value });
    };

    const validate = () => {
      return true;
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
      onClose();
    };

    const formError = (errorResponse) => {
      setProcessing(false);
      setErrors(errorResponse?.errors || 'unknown error');
    };

    const handleOnCancel = () => {
      onClose();
    };

    const handleOnSubmit = async () => {
      let { title_multiloc } = formValues;

      if (!processing && validate() && title_multiloc && mapLayer) {
        formProcessing();

        const isTitleMultilocEmpty = Object.getOwnPropertyNames(
          title_multiloc
        ).every((key) => isEmpty((title_multiloc as Multiloc)[key]));

        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (isTitleMultilocEmpty && mapConfig && !isNilOrError(tenantLocales)) {
          title_multiloc = getUnnamedLayerTitleMultiloc(tenantLocales);
        }

        const geojson = cloneDeep(
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          mapLayer?.geojson || {}
        ) as GeoJSON.FeatureCollection;

        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        geojson?.features.forEach((feature) => {
          feature.properties = {
            ...feature.properties,
            'fill-opacity': 0.3,
            'stroke-width': 3,
            'stroke-opacity': 1,
            'marker-size': 'medium',
            'marker-symbol': formValues.markerSymbol,
            tooltipContent: formValues.tooltipContent,
          };

          if (formValues.color !== getLayerColor(mapLayer)) {
            feature.properties = {
              ...feature.properties,
              fill: formValues.color,
              stroke: formValues.color,
              'marker-color': formValues.color,
            };
          }
        });

        try {
          await updateProjectMapLayer({
            id: mapLayer.id,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            mapConfigId: mapConfig?.data?.id,
            title_multiloc,
            geojson,
          });
          formSuccess();
        } catch (errorResponse) {
          formError(errorResponse);
        }
      }
    };

    return (
      <Container className={className || ''}>
        <SubSectionTitle>
          <FormattedMessage {...messages.editLayer} />
        </SubSectionTitle>

        <StyledSection>
          <SectionField>
            <InputMultilocWithLocaleSwitcher
              type="text"
              valueMultiloc={formValues.title_multiloc}
              onChange={handleTitleOnChange}
              label={formatMessage(messages.layerName)}
              labelTooltipText={formatMessage(messages.layerNameTooltip)}
            />
          </SectionField>

          <SectionField>
            <InputMultilocWithLocaleSwitcher
              type="text"
              valueMultiloc={formValues.tooltipContent}
              onChange={handleTooltipContentOnChange}
              label={formatMessage(messages.layerTooltip)}
              labelTooltipText={formatMessage(messages.layerTooltipTooltip)}
            />
          </SectionField>

          {geojsonDataType === 'Point' && (
            <SectionField>
              <Select
                onChange={handleMarkerSymbolOnChange}
                label={formatMessage(messages.layerIconName)}
                labelTooltipText={
                  <FormattedMessage
                    {...messages.layerIconNameTooltip}
                    values={{
                      url: (
                        <a
                          href="https://github.com/olistik/maki-icons-list"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {formatMessage(messages.here)}
                        </a>
                      ),
                    }}
                  />
                }
                value={formValues.markerSymbol}
                options={[
                  {
                    value: '',
                    label: '',
                  },
                  ...makiIconOptions,
                ]}
              />
            </SectionField>
          )}

          <SectionField>
            <ColorPickerInput
              type="text"
              value={formValues.color}
              onChange={handleColorOnChange}
              label={formatMessage(messages.layerColor)}
              labelTooltipText={formatMessage(messages.layerColorTooltip)}
            />
          </SectionField>
        </StyledSection>

        <Footer>
          <FooterLeft>
            <ButtonWithLink
              buttonStyle="admin-dark"
              onClick={handleOnSubmit}
              processing={processing}
              disabled={!touched}
            >
              <FormattedMessage {...messages.save} />
            </ButtonWithLink>

            <CancelButton
              buttonStyle="secondary-outlined"
              onClick={handleOnCancel}
              disabled={processing}
            >
              <FormattedMessage {...messages.cancel} />
            </CancelButton>
          </FooterLeft>
          <FooterRight>
            {!isEmpty(errors) && (
              <Error
                text={formatMessage(messages.errorMessage)}
                showBackground={false}
                showIcon={false}
              />
            )}
          </FooterRight>
        </Footer>
      </Container>
    );
  }
);

export default injectIntl(MapLayerConfig);
