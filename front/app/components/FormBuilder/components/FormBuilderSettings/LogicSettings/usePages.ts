import { useFormContext } from 'react-hook-form';

import {
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
} from 'api/custom_fields/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import { getFieldNumbers } from '../../utils';

type PageListType =
  | {
      value: string | undefined;
      label: string;
      disabled?: boolean;
    }[];

const usePages = (field: IFlatCustomFieldWithIndex) => {
  const { formatMessage } = useIntl();
  const { watch } = useFormContext();
  const localize = useLocalize();

  const formCustomFields: IFlatCustomField[] = watch('customFields');
  const fieldType = watch(`customFields.${field.index}.input_type`);

  const getPageList = () => {
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
  };

  // Which page is the current question on?
  // Technically there should always be a current page ID and null should never be returned
  const getCurrentPageId = (
    field: IFlatCustomFieldWithIndex
  ): string | null => {
    if (fieldType === 'page') return field.id;

    let pageId: string | null = null;
    for (const formCustomField of formCustomFields) {
      if (formCustomField.input_type === 'page') pageId = formCustomField.id;
      if (formCustomField.id === field.id) return pageId;
    }
    return null;
  };

  const pageOptions = getPageList();

  // Current and previous pages should be disabled in select options
  let disablePage = true;
  const pages: PageListType = pageOptions.map((page) => {
    const newPage = {
      ...page,
      disabled: disablePage,
    };
    if (page.value === getCurrentPageId(field)) {
      disablePage = false;
    }
    return newPage;
  });

  return pages;
};

export default usePages;
