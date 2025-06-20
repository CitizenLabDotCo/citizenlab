import { useFormContext } from 'react-hook-form';

import { IFlatCustomField } from 'api/custom_fields/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import { getFieldNumbers } from '../utils';

function usePageList() {
  const { watch } = useFormContext();
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const formCustomFields: IFlatCustomField[] = watch('customFields');
  const fieldNumbers = getFieldNumbers(formCustomFields);
  const pageArray: { value: string; label: string }[] = [];

  formCustomFields.forEach((field, i) => {
    if (field.input_type === 'page') {
      const isLastPage = i === formCustomFields.length - 1;

      const pageTitle = localize(field.title_multiloc);
      const pageLabel = isLastPage
        ? formatMessage(messages.lastPage)
        : `${formatMessage(messages.page)} ${fieldNumbers[field.id]}${
            pageTitle
              ? `: ${
                  pageTitle.length > 25
                    ? `${pageTitle.slice(0, 25)}...`
                    : pageTitle
                }`
              : ''
          }`;

      pageArray.push({
        value: field.temp_id || field.id,
        label: pageLabel,
      });
    }
  });

  return pageArray;
}

export default usePageList;
