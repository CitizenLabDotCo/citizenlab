import React, { useState, useEffect, useMemo, ReactNode } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { omitBy, isNil, isEmpty, isString, debounce } from 'lodash-es';
import { stringify } from 'qs';
import { useForm, FormProvider } from 'react-hook-form';
import styled from 'styled-components';
import { ObjectSchema } from 'yup';

import useLocale from 'hooks/useLocale';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import Modal from 'components/UI/Modal';

import { ScreenReaderOnly } from 'utils/a11y';
import { trackEventByName } from 'utils/analytics';
import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';
import WidgetCode from '../WidgetCode';
import WidgetPreview from '../WidgetPreview';

const Container = styled.div`
  display: flex;
`;

const WidgetConfigWrapper = styled.div`
  flex: 1 1 500px;
  display: flex;
  flex-direction: column;
`;

const WidgetPreviewWrapper = styled.div``;

const WidgetTitle = styled.h3``;

const StyledWidgetPreview = styled(WidgetPreview)`
  margin-bottom: 40px;
`;

interface Props {
  widgetPath: string;
  schema: ObjectSchema<any>;
  defaultValues: Record<string, any>;
  trackEventName: string;
  children: ReactNode;
}

const WidgetBuilder = ({
  widgetPath,
  schema,
  defaultValues,
  trackEventName,
  children,
}: Props) => {
  const locale = useLocale();
  const [codeModalOpened, setCodeModalOpened] = useState(false);
  const [widgetParams, setWidgetParams] = useState('');

  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const formValues = methods.watch();

  const getWidgetParams = useMemo(() => {
    return debounce((formValues: Record<string, any>) => {
      const cleanedParams = omitBy(
        formValues,
        (v) => isNil(v) || (isString(v) && isEmpty(v))
      );
      setWidgetParams(stringify({ ...cleanedParams, locale }));
    }, 500);
  }, []);

  useEffect(() => {
    getWidgetParams(formValues);
  }, [getWidgetParams, formValues]);

  const handleCloseCodeModal = () => {
    setCodeModalOpened(false);
  };

  const handleShowCodeClick = () => {
    setCodeModalOpened(true);
    trackEventByName(trackEventName);
  };

  return (
    <Container>
      <WidgetConfigWrapper>
        <WidgetTitle>
          <FormattedMessage {...messages.settingsTitle} />
        </WidgetTitle>
        <FormProvider {...methods}>
          <form>{children}</form>
        </FormProvider>
      </WidgetConfigWrapper>
      <WidgetPreviewWrapper>
        <WidgetTitle>
          <FormattedMessage {...messages.previewTitle} />
        </WidgetTitle>
        <StyledWidgetPreview
          path={`${widgetPath}?${widgetParams}`}
          width={methods.getValues('width') || 300}
          height={methods.getValues('height') || 400}
        />
        <ButtonWithLink
          onClick={handleShowCodeClick}
          buttonStyle="admin-dark"
          icon="code"
        >
          <FormattedMessage {...messages.exportHtmlCodeButton} />
        </ButtonWithLink>
      </WidgetPreviewWrapper>

      <Modal
        opened={codeModalOpened}
        close={handleCloseCodeModal}
        fixedHeight={true}
        ariaLabelledBy="widget-code-modal-title"
      >
        <ScreenReaderOnly id="widget-code-modal-title">
          <FormattedMessage {...messages.htmlCodeTitle} />
        </ScreenReaderOnly>
        <WidgetCode
          path={`${widgetPath}?${widgetParams}`}
          width={methods.getValues('width') || 300}
          height={methods.getValues('height') || 400}
        />
      </Modal>
    </Container>
  );
};

export default WidgetBuilder;
