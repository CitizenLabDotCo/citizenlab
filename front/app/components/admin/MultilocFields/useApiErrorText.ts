import { CLError } from 'typings';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import {
  findErrorMessageDescriptor,
  getApiErrorValues,
  TFieldName,
} from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';

const isText = (text: string | undefined): text is string => !!text;

// The text the Error component would show, for a design-system field's
// errorMessage or a Banner. The field name picks field-specific messages,
// e.g. title_multiloc_blank.
const useApiErrorText = () => {
  const { formatMessage } = useIntl();
  const { data: appConfiguration } = useAppConfiguration();

  return (apiErrors: CLError[] | null | undefined, fieldName?: TFieldName) => {
    if (!apiErrors || apiErrors.length === 0) return undefined;

    const texts = apiErrors
      .map((error) => {
        const descriptor = findErrorMessageDescriptor(fieldName, error.error);
        return descriptor
          ? formatMessage(
              descriptor,
              getApiErrorValues(error, appConfiguration)
            )
          : undefined;
      })
      .filter(isText);

    return texts.length > 0 ? [...new Set(texts)].join(' ') : undefined;
  };
};

export default useApiErrorText;
