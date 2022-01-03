import React from 'react';

// components
import Error from 'components/UI/Error';
import { IconTooltip } from 'cl2-component-library';
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
import messages from '../messages';

// typings
import { IAppConfiguration } from 'services/appConfiguration';
import { CLErrors } from 'typings';

interface Props {
  currentTenant: IAppConfiguration;
  locale: string;
  slug: string | null;
  apiErrors: CLErrors;
  showSlugErrorMessage: boolean;
  handleSlugOnChange: (slug: string) => void;
}

export default injectIntl(
  ({
    currentTenant,
    locale,
    slug,
    apiErrors,
    showSlugErrorMessage,
    handleSlugOnChange,
    intl: { formatMessage },
  }: Props & InjectedIntlProps) => (
    <StyledSectionField>
      <SubSectionTitle>
        <FormattedMessage {...messages.projectUrl} />
        <IconTooltip
          content={
            <FormattedMessage
              {...messages.urlSlugTooltip}
              values={{
                currentProjectURL: (
                  <em>
                    <b>
                      {currentTenant.data.attributes.host}/{locale}
                      /projects/{slug}
                    </b>
                  </em>
                ),
                currentProjectSlug: (
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
        id="project-slug"
        type="text"
        label={<FormattedMessage {...messages.urlSlugLabel} />}
        onChange={handleSlugOnChange}
        value={slug}
      />
      <SlugPreview>
        <b>{formatMessage(messages.resultingURL)}</b>:{' '}
        {currentTenant?.data.attributes.host}/{locale}/projects/
        {slug}
      </SlugPreview>
      {/* Backend error */}
      <Error fieldName="slug" apiErrors={apiErrors.slug} />
      {/* Frontend error */}
      {showSlugErrorMessage && (
        <Error text={formatMessage(messages.regexError)} />
      )}
    </StyledSectionField>
  )
);
