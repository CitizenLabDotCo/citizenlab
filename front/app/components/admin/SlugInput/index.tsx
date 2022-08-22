import React from 'react';

// components
import Error from 'components/UI/Error';
import { IconTooltip } from '@citizenlab/cl2-component-library';
import { SubSectionTitle } from 'components/admin/Section';
import {
  StyledSectionField,
  StyledWarning,
  StyledInput,
  SlugPreview,
} from './styling';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// typings
import { CLErrors } from 'typings';

export interface Props {
  inputFieldId?: string;
  slug: string | null;
  previewUrlWithoutSlug: string;
  apiErrors: CLErrors;
  showSlugErrorMessage: boolean;
  handleSlugOnChange: (slug: string) => void;
}

const SlugInput = ({
  inputFieldId,
  slug,
  previewUrlWithoutSlug,
  apiErrors,
  showSlugErrorMessage,
  handleSlugOnChange,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const previewUrl = `${previewUrlWithoutSlug}/${slug}`;

  return (
    <StyledSectionField>
      <SubSectionTitle>
        <FormattedMessage {...messages.url} />
        <IconTooltip
          content={
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
      <StyledWarning>
        <FormattedMessage {...messages.urlSlugBrokenLinkWarning} />
      </StyledWarning>
      <StyledInput
        id={inputFieldId}
        type="text"
        label={<FormattedMessage {...messages.urlSlugLabel} />}
        onChange={handleSlugOnChange}
        value={slug}
      />
      <SlugPreview>
        <b>{formatMessage(messages.resultingURL)}</b>: {previewUrl}
      </SlugPreview>
      {/* Backend error */}
      <Error fieldName="slug" apiErrors={apiErrors.slug} />
      {/* Frontend error */}
      {showSlugErrorMessage && (
        <Error text={formatMessage(messages.regexError)} />
      )}
    </StyledSectionField>
  );
};

export default injectIntl(SlugInput);
