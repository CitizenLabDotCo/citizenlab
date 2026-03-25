import React from 'react';

import { object, string, array, number } from 'yup';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import { useIntl } from 'utils/cl-intl';

import WidgetBuilder from '../WidgetBuilder';
import {
  sharedSchemaFields,
  getSharedDefaultValues,
} from '../WidgetBuilder/shared';

import Form from './Form';
import tracks from './tracks';

const schema = object({
  ...sharedSchemaFields,
  projects: array().of(string().required()).max(3).required(),
  folders: array().of(string().required()).required(),
  sort: string()
    .oneOf(['newest', 'ending_soon', 'most_participants', 'platform_order'])
    .required(),
  limit: number().min(1).max(10).required(),
});

const ProjectsWidget = () => {
  const { formatMessage } = useIntl();
  const { data: appConfig } = useAppConfiguration();
  const core = appConfig?.data.attributes.settings.core;

  const defaultValues = {
    ...getSharedDefaultValues(formatMessage, {
      accentColor: core?.color_main,
      textColor: core?.color_text,
    }),
    projects: [],
    folders: [],
    sort: 'newest' as const,
    limit: 3,
  };

  return (
    <WidgetBuilder
      widgetPath="/projects"
      schema={schema}
      defaultValues={defaultValues}
      trackEventName={tracks.clickAdminExportHTML}
    >
      <Form />
    </WidgetBuilder>
  );
};

export default ProjectsWidget;
