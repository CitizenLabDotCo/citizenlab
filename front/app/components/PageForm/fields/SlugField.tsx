import React from 'react';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useLocale from 'hooks/useLocale';
import usePage from 'hooks/usePage';

// components
import FormikInput from 'components/UI/FormikInput';
import { SectionField } from 'components/admin/Section';
import { Label, IconTooltip } from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';
import Warning from 'components/UI/Warning';
import { Field, FormikErrors } from 'formik';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { FormValues } from '..';

const StyledFormikInput = styled(FormikInput)`
  margin-bottom: 20px;
`;

const SlugPreview = styled.div`
  margin-bottom: 20px;
  font-size: ${fontSizes.base}px;
`;

const StyledWarning = styled(Warning)`
  margin-bottom: 15px;
`;

interface Props {
  pageId: string | null;
  values: FormValues;
  error?: FormikErrors<string>;
}

export default ({ pageId, values, error }: Props) => {
  const locale = useLocale();
  const page = usePage({ pageId });
  const appConfig = useAppConfiguration();

  if (isNilOrError(appConfig)) return null;

  return (
    <SectionField>
      <Label>
        <FormattedMessage {...messages.pageUrl} />
        {!isNilOrError(page) && (
          <IconTooltip
            content={
              <FormattedMessage
                {...messages.slugLabelTooltip}
                values={{
                  currentPageURL: (
                    <em>
                      <b>
                        {appConfig.data.attributes.host}/{locale}
                        /pages/{page.attributes.slug}
                      </b>
                    </em>
                  ),
                  currentPageSlug: (
                    <em>
                      <b>{page.attributes.slug}</b>
                    </em>
                  ),
                }}
              />
            }
          />
        )}
      </Label>
      {!isNilOrError(page) && (
        <StyledWarning>
          <FormattedMessage {...messages.brokenURLWarning} />
        </StyledWarning>
      )}
      <Field name="slug" component={StyledFormikInput} />
      <SlugPreview>
        <b>
          <FormattedMessage {...messages.resultingPageURL} />
        </b>
        : {appConfig.data.attributes.host}/{locale}/pages/
        {values.slug}
      </SlugPreview>
      {/*
        Very hacky way to have the Formik form deal well with client-side validation.
        Ideally needs the API errors implemented as well.
      */}
      {error === 'empty_slug' && (
        <Error
          fieldName="slug"
          text={<FormattedMessage {...messages.emptySlugError} />}
        />
      )}
      {error === 'invalid_slug' && (
        <Error
          fieldName="slug"
          text={<FormattedMessage {...messages.slugRegexError} />}
        />
      )}
      {error === 'taken_slug' && (
        <Error
          fieldName="slug"
          text={<FormattedMessage {...messages.takenSlugError} />}
        />
      )}
    </SectionField>
  );
};
