import React from 'react';
import useLocale from 'hooks/useLocale';
import useAppConfiguration from 'hooks/useAppConfiguration';

// components
import Error from 'components/UI/Error';
import { IconTooltip } from '@citizenlab/cl2-component-library';
import { SubSectionTitle } from 'components/admin/Section';
import { StyledSectionField } from './styling';
import NewSlugInput from 'components/Admin/NewSlugInput';

// i18n
import { WrappedComponentProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// typings
import { CLErrors } from 'typings';
import { isNilOrError } from 'utils/helperUtils';

type TApiErrors = CLErrors | null;

export interface Props {
  slug: string | null;
  pathnameWithoutSlug: string;
  apiErrors: TApiErrors;
  showSlugErrorMessage: boolean;
  onSlugChange: (slug: string) => void;
}

const SlugInputField = ({
  slug,
  pathnameWithoutSlug,
  apiErrors,
  showSlugErrorMessage,
  onSlugChange,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const locale = useLocale();
  const appConfig = useAppConfiguration();

  if (!isNilOrError(locale) && !isNilOrError(appConfig)) {
    const hostName = appConfig.attributes.host;
    const previewUrl = slug
      ? `${hostName}/${locale}/${pathnameWithoutSlug}/${slug}`
      : null;

    return (
      <StyledSectionField>
        <SubSectionTitle>
          <FormattedMessage {...messages.url} />
          <IconTooltip
            content={
              // needs to change
              <FormattedMessage
                {...messages.urlSlugTooltip}
                values={{
                  currentURL: (
                    <em>
                      <b>{previewUrl}</b>
                    </em>
                  ),
                  currentSlug: (
                    <em>
                      <b>{slug}</b>
                    </em>
                  ),
                }}
              />
            }
          />
        </SubSectionTitle>
        {slug && previewUrl && (
          <NewSlugInput
            currentSlug={slug}
            onChange={onSlugChange}
            previewUrl={previewUrl}
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

export default injectIntl(SlugInputField);
