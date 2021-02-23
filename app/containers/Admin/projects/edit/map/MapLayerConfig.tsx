import React, { memo, useEffect, useState } from 'react';
import { isEmpty, cloneDeep } from 'lodash-es';

// services
import { updateProjectMapLayer } from 'services/mapLayers';

// hooks
import useMapConfig from 'hooks/useMapConfig';

// components
import {
  Section,
  SectionField,
  SubSectionTitle,
} from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import { ColorPickerInput, Select } from 'cl2-component-library';

// utils
import { getLayerColor, getLayerType, makiIconNames } from 'utils/map';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// styling
import styled from 'styled-components';

// typing
import { Multiloc, IOption } from 'typings';

const Container = styled.div`
  display: flex;
  flex-direction: column;
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

const CancelButton = styled(Button)`
  margin-left: 10px;
`;

interface Props {
  projectId: string;
  mapLayerId: string;
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

const MapLayerConfig = memo<Props & InjectedIntlProps & InjectedLocalized>(
  ({ projectId, mapLayerId, className, onClose, intl: { formatMessage } }) => {
    const mapConfig = useMapConfig({ projectId });

    const mapLayer =
      mapConfig?.attributes?.layers?.find((layer) => layer.id === mapLayerId) ||
      undefined;
    const type = getLayerType(mapLayer);

    const [touched, setTouched] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: any }>({});
    const [formValues, setFormValues] = useState<IFormValues>({
      title_multiloc: mapLayer?.title_multiloc || null,
      color: getLayerColor(mapLayer),
      markerSymbol:
        mapLayer?.geojson?.features?.[0]?.properties?.['marker-symbol'] || '',
      tooltipContent:
        mapLayer?.geojson?.features?.[0]?.properties?.tooltipContent,
    });

    useEffect(() => {
      formChange(
        {
          title_multiloc: mapLayer?.title_multiloc || null,
          color: getLayerColor(mapLayer),
          markerSymbol:
            mapLayer?.geojson?.features?.[0]?.properties?.['marker-symbol'] ||
            '',
          tooltipContent:
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
      setErrors(errorResponse?.json?.errors || 'unknown error');
    };

    const handleOnCancel = () => {
      onClose();
    };

    const handleOnSubmit = async () => {
      const { title_multiloc } = formValues;

      if (!processing && validate() && title_multiloc && mapLayer) {
        formProcessing();

        const geojson = cloneDeep(
          mapLayer?.geojson || {}
        ) as GeoJSON.FeatureCollection;

        geojson?.features.forEach((feature) => {
          feature.properties = {
            ...feature.properties,
            'fill-opacity': 0.3,
            'stroke-width': 2,
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
          await updateProjectMapLayer(projectId, mapLayer.id, {
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

          {type === 'Point' && (
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
            <Button
              buttonStyle="admin-dark"
              onClick={handleOnSubmit}
              processing={processing}
              disabled={!touched}
            >
              <FormattedMessage {...messages.save} />
            </Button>

            <CancelButton
              buttonStyle="secondary"
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

export default injectIntl(injectLocalize(MapLayerConfig));
