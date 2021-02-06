import React, { memo, useEffect, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { isEmpty, cloneDeep } from 'lodash-es';

// services
import { updateProjectMapLayer } from 'services/mapLayers';

// hooks
import useMapLayer from 'hooks/useMapLayer';

// components
import { Section, SectionField, SectionTitle } from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';

// i18n
import T from 'components/T';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// styling
import styled from 'styled-components';

// typing
import { Multiloc } from 'typings';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const ButtonContainer = styled.div`
  display: flex;
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
}

const LayerConfig = memo<Props & InjectedIntlProps>(
  ({ projectId, mapLayerId, className, onClose, intl: { formatMessage } }) => {
    const mapLayer = useMapLayer({ projectId, mapLayerId });

    const [touched, setTouched] = useState(false);
    const [processing, setProcessing] = useState(false);
    // const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: any }>({});
    const [formValues, setFormValues] = useState<IFormValues>({
      title_multiloc: !isNilOrError(mapLayer)
        ? mapLayer.attributes.title_multiloc
        : null,
    });

    useEffect(() => {
      setFormValues({
        title_multiloc: !isNilOrError(mapLayer)
          ? mapLayer.attributes.title_multiloc
          : null,
      });
    }, [mapLayer]);

    const handleTitleOnChange = (title_multiloc: Multiloc) => {
      formChange({ title_multiloc });
    };

    const validate = () => {
      return true;
    };

    const formChange = (changedFormValue: Partial<IFormValues>) => {
      setTouched(true);
      // setSuccess(false);
      setFormValues((prevFormValues) => ({
        ...prevFormValues,
        ...changedFormValue,
      }));
    };

    const formProcessing = () => {
      setProcessing(true);
      setErrors({});
      // setSuccess(false);
    };

    const formSuccess = () => {
      setProcessing(false);
      setErrors({});
      setTouched(false);
      // setSuccess(true);
      onClose();
    };

    const formError = (errorResponse) => {
      setProcessing(false);
      setErrors(errorResponse?.json?.errors || {});
      // setSuccess(false);
    };

    const handleOnCancel = () => {
      onClose();
    };

    const handleOnSubmit = async () => {
      const { title_multiloc } = formValues;

      if (!processing && validate() && title_multiloc) {
        formProcessing();

        const geojson = (!isNilOrError(mapLayer)
          ? cloneDeep(mapLayer.attributes.geojson)
          : {}) as GeoJSON.FeatureCollection;

        geojson?.features.forEach((feature) => {
          feature.properties = {
            stroke: '#d50101',
            'stroke-width': 4,
            'stroke-opacity': 1,
            fill: '#8100bd',
            'fill-opacity': 0.3,
            tooltipContent: 'This is the tooltip content',
          };
        });

        try {
          await updateProjectMapLayer(projectId, mapLayerId, {
            title_multiloc,
            geojson,
          });
          formSuccess();
        } catch (errorResponse) {
          formError(errorResponse);
        }
      }
    };

    if (!isNilOrError(mapLayer)) {
      return (
        <Container className={className || ''}>
          {/* <SectionTitle>
            <T value={mapLayer.attributes.title_multiloc} />
          </SectionTitle> */}

          <Section>
            <SectionField>
              <InputMultilocWithLocaleSwitcher
                type="text"
                id="cause-title"
                valueMultiloc={formValues.title_multiloc}
                onChange={handleTitleOnChange}
                label={formatMessage(messages.titleLabel)}
              />
            </SectionField>
          </Section>

          <ButtonContainer>
            <Button
              buttonStyle="admin-dark"
              onClick={handleOnSubmit}
              processing={processing}
              disabled={!touched}
            >
              <FormattedMessage {...messages.save} />
            </Button>

            <CancelButton
              buttonStyle="secondary-outlined"
              onClick={handleOnCancel}
              disabled={processing}
            >
              <FormattedMessage {...messages.cancel} />
            </CancelButton>

            {!isEmpty(errors) && (
              <Error
                text={formatMessage(messages.errorMessage)}
                showBackground={false}
                showIcon={false}
              />
            )}
          </ButtonContainer>
        </Container>
      );
    }

    return null;
  }
);

export default injectIntl(LayerConfig);
