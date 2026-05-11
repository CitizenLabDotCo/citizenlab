import React from 'react';

import { object, string, array, number } from 'yup';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import { useIntl } from 'utils/cl-intl';

import WidgetBuilder from '..';
import { sharedSchemaFields, getSharedDefaultValues } from '../shared';

import Form from './Form';
import tracks from './tracks';

const schema = object({
  ...sharedSchemaFields,
  sort: string().oneOf(['trending', 'popular', 'newest']).required(),
  topics: array().of(string().required()).required(),
  projects: array().of(string().required()).required(),
  limit: number().required(),
});

const IdeasWidget = () => {
  const { formatMessage } = useIntl();
  const { data: appConfig } = useAppConfiguration();
  const core = appConfig?.data.attributes.settings.core;

  const defaultValues = {
    ...getSharedDefaultValues(formatMessage, {
      accentColor: core?.color_main,
      textColor: core?.color_text,
    }),
    sort: 'trending' as const,
    projects: [],
    topics: [],
    limit: 5,
  };

  return (
    <WidgetBuilder
      widgetPath="/ideas"
      schema={schema}
      defaultValues={defaultValues}
      trackEventName={tracks.clickAdminExportHTML}
    >
      <Form />
    </WidgetBuilder>
  );
};

export default IdeasWidget;
