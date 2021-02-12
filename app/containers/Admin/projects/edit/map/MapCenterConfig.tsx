import React, { memo, useState, useEffect } from 'react';
import { isEmpty } from 'lodash-es';

// services
import { updateProjectMapLayer } from 'services/mapLayers';

// hooks
import useMapConfig from 'hooks/useMapConfig';

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
  margin-left: 15px;
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
    const mapConfig = useMapConfig({ projectId });

    const [touched, setTouched] = useState(false);
    const [processing, setProcessing] = useState(false);
    // const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: any }>({});
    const [formValues, setFormValues] = useState<IFormValues>({
      center: null,
    });

    useEffect(() => {
      formChange(
        {
          center: null,
        },
        false
      );
    }, [mapConfig]);

    const validate = () => {
      return true;
    };

    const formChange = (
      changedFormValue: Partial<IFormValues>,
      touched = true
    ) => {
      // setSuccess(false);
      setTouched(touched);
      setFormValues((prevFormValues) => ({
        ...prevFormValues,
        ...changedFormValue,
      }));
    };

    const formProcessing = () => {
      setProcessing(true);
      // setSuccess(false);
      setErrors({});
    };

    const formSuccess = () => {
      setProcessing(false);
      // setSuccess(true);
      setErrors({});
      setTouched(false);
    };

    const formError = (errorResponse) => {
      setProcessing(false);
      // setSuccess(false);
      setErrors(errorResponse?.json?.errors || 'unknown error');
    };

    const handleOnChange = (center: string) => {
      formChange({ center });
    };

    const handleOnSave = async (event: React.FormEvent) => {
      event.preventDefault();
      if (validate()) {
        try {
          formProcessing();
          // await updateProjectMapLayer(projectId, mapLayer.id, {
          //   title_multiloc,
          //   geojson,
          // });
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
            placeholder="lat, lng"
          />
          <SaveButton
            buttonStyle="admin-dark"
            onClick={handleOnSave}
            processing={processing}
            disabled={!touched}
            padding="12px 14px"
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
