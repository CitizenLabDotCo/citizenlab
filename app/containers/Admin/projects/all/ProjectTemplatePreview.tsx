import React, { memo, useCallback, useState } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError, transformLocale } from 'utils/helperUtils';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// graphql
import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';

// components
import Button from 'components/UI/Button';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';

const Container = styled.div``;

export interface InputProps {
  projectTemplateId: string;
  className?: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
}

interface Props extends DataProps, InputProps { }

const ProjectTemplatePreview = memo<Props & InjectedIntlProps>(({ locale, intl: { formatMessage }, projectTemplateId, className }) => {

  const graphQLLocale = !isNilOrError(locale) ? transformLocale(locale) : null;

  const DEPARTMENTS_QUERY = gql`
    {
      departments {
        nodes {
          id
          titleMultiloc {
            ${graphQLLocale}
          }
        }
      }
    }
  `;

  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const { data } = useQuery(DEPARTMENTS_QUERY);

  const handleUseTemplateOnClick = useCallback(() => {
    // empty
  }, []);

  return (
    <Container className={className}>
      Preview page
    </Container>
  );
});

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />
});

const ProjectTemplatePreviewWithHoC = injectIntl(ProjectTemplatePreview);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <ProjectTemplatePreviewWithHoC {...dataProps} {...inputProps} />}
  </Data>
);
