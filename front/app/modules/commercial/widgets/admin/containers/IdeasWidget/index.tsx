import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { omitBy, isNil, isEmpty, isString, debounce } from 'lodash-es';
import { stringify } from 'qs';

import Form, { FormValues } from './Form';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { string, object, number, boolean, array } from 'yup';

import WidgetPreview from '../WidgetPreview';
import Modal from 'components/UI/Modal';
import WidgetCode from '../WidgetCode';
import Button from 'components/UI/Button';

import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from '../../messages';

import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

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

const schema = object({
  width: number(),
  height: number(),
  siteBgColor: string(),
  textColor: string(),
  accentColor: string(),
  font: string().nullable(),
  fontSize: number(),
  relativeLink: string(),
  showHeader: boolean(),
  showLogo: boolean(),
  headerText: string(),
  headerSubText: string(),
  showFooter: boolean(),
  buttonText: string(),
  sort: string().oneOf(['trending', 'popular', 'new']),
  topics: array().of(string()),
  projects: array().of(string()),
  limit: number(),
});

const IdeasWidget = ({ intl: { formatMessage } }: WrappedComponentProps) => {
  const [codeModalOpened, setCodeModalOpened] = useState(false);
  const [widgetParams, setWidgetParams] = useState('');

  const initialValues = (): FormValues => {
    return {
      width: 320,
      height: 400,
      siteBgColor: '#ffffff',
      bgColor: '#ffffff',
      textColor: '#666666',
      accentColor: '#2233aa',
      font: null,
      fontSize: 15,
      relativeLink: '/',
      showHeader: true,
      showLogo: true,
      headerText: formatMessage(messages.fieldHeaderTextDefault),
      headerSubText: formatMessage(messages.fieldHeaderSubTextDefault),
      showFooter: true,
      buttonText: formatMessage(messages.fieldButtonTextDefault),
      sort: 'trending',
      projects: [],
      topics: [],
      limit: 5,
    };
  };

  const methods = useForm({
    mode: 'onBlur',
    defaultValues: initialValues(),
    resolver: yupResolver(schema),
  });

  const formValues = methods.watch();

  const getWidgetParams = useMemo(() => {
    return debounce((formValues: FormValues) => {
      const cleanedParams = omitBy(
        formValues,
        (v) => isNil(v) || (isString(v) && isEmpty(v))
      );
      setWidgetParams(stringify(cleanedParams));
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
    trackEventByName(tracks.clickAdminExportHTML.name);
  };

  return (
    <Container>
      <WidgetConfigWrapper>
        <WidgetTitle>
          <FormattedMessage {...messages.settingsTitle} />
        </WidgetTitle>
        <FormProvider {...methods}>
          <form>
            <Form defaultValues={initialValues()} />
          </form>
        </FormProvider>
      </WidgetConfigWrapper>
      <WidgetPreviewWrapper>
        <WidgetTitle>
          <FormattedMessage {...messages.previewTitle} />
        </WidgetTitle>
        <StyledWidgetPreview
          path={`/ideas?${widgetParams}`}
          width={methods.getValues('width') || 300}
          height={methods.getValues('height') || 400}
        />
        <Button onClick={handleShowCodeClick} buttonStyle="cl-blue" icon="code">
          <FormattedMessage {...messages.exportHtmlCodeButton} />
        </Button>
      </WidgetPreviewWrapper>

      <Modal
        opened={codeModalOpened}
        close={handleCloseCodeModal}
        fixedHeight={true}
      >
        <WidgetCode
          path={`/ideas?${widgetParams}`}
          width={methods.getValues('width') || 300}
          height={methods.getValues('height') || 400}
        />
      </Modal>
    </Container>
  );
};

export default injectIntl(IdeasWidget);
