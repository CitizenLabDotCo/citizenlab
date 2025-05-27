import React, { useState, useEffect, useMemo } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { omitBy, isNil, isEmpty, isString, debounce } from 'lodash-es';
import { stringify } from 'qs';
import { useForm, FormProvider } from 'react-hook-form';
import styled from 'styled-components';
import { string, object, number, boolean, array } from 'yup';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import Modal from 'components/UI/Modal';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import WidgetCode from '../WidgetCode';
import WidgetPreview from '../WidgetPreview';

import Form, { FormValues } from './Form';
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

const IdeasWidget = () => {
  const { formatMessage } = useIntl();
  const [codeModalOpened, setCodeModalOpened] = useState(false);
  const [widgetParams, setWidgetParams] = useState('');

  const initialValues = {
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
    sort: 'trending' as const,
    projects: [],
    topics: [],
    limit: 5,
  };

  const methods = useForm({
    mode: 'onBlur',
    defaultValues: initialValues,
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
    trackEventByName(tracks.clickAdminExportHTML);
  };

  return (
    <Container>
      <WidgetConfigWrapper>
        <WidgetTitle>
          <FormattedMessage {...messages.settingsTitle} />
        </WidgetTitle>
        <FormProvider {...methods}>
          <form>
            <Form />
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

export default IdeasWidget;
