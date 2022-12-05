import React from 'react';
import useLocale from 'hooks/useLocale';
import useAppConfiguration from 'hooks/useAppConfiguration';

// components
import Error from 'components/UI/Error';
import { SubSectionTitle } from 'components/admin/Section';
import { StyledSectionField } from './styling';
import SlugInput from 'components/admin/SlugInput';
import SlugInputComponent from 'components/admin/SlugInput/InputComponent';

// i18n
import { useIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// typings
import { CLErrors } from 'typings';
import { isNilOrError } from 'utils/helperUtils';

type TApiErrors = CLErrors | null;

export interface Props {
  slug: string;
  pathnameWithoutSlug: string;
  apiErrors: TApiErrors;
  showSlugErrorMessage: boolean;
  onSlugChange: (slug: string) => void;
  slugHasChanged: boolean;
}

const SlugInputField = ({
  slug,
  pathnameWithoutSlug,
  apiErrors,
  showSlugErrorMessage,
  onSlugChange,
  slugHasChanged,
}: Props) => {
  const locale = useLocale();
  const appConfig = useAppConfiguration();
  const { formatMessage } = useIntl();

  if (!isNilOrError(locale) && !isNilOrError(appConfig)) {
    const hostName = appConfig.attributes.host;
    const previewUrl = slug
      ? `${hostName}/${locale}/${pathnameWithoutSlug}/${slug}`
      : null;

    return (
      <StyledSectionField>
        <SubSectionTitle>
          <FormattedMessage {...messages.url} />
        </SubSectionTitle>
        {previewUrl && (
          <SlugInput
            inputComponent={
              <SlugInputComponent onChange={onSlugChange} slug={slug} />
            }
            previewUrl={previewUrl}
            showWarningMessage={slugHasChanged}
          />
        )}
        {/* Backend error */}
        {apiErrors && <Error fieldName="slug" apiErrors={apiErrors.slug} />}
        {/* Frontend error */}
        {showSlugErrorMessage && (
          <Error text={formatMessage(messages.regexError)} />
        )}
      </StyledSectionField>
    );
  }

  return null;
};

export default SlugInputField;
