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

// utils
import { isAdminPage } from 'utils/helperUtils';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../containers/Admin/projects/all/messages';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';

const Container = styled.div`
  width: 500px;
  height: 800px;
  padding: 20px;
  background: #fff;
  border-radius: ${({ theme }) => theme.borderRadius};
  border: solid 1px #e0e0e0;
`;

const AdminHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: solid 1px red;
  margin-bottom: 20px;
`;

export interface InputProps {
  projectTemplateId: string;
  className?: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
}

interface Props extends DataProps, InputProps { }

const ProjectTemplatePreview = memo<Props & InjectedIntlProps>(({ locale, intl, projectTemplateId, className }) => {

  const graphQLLocale = !isNilOrError(locale) ? transformLocale(locale) : null;

  const adminPage = isAdminPage(location.pathname);

  const TEMPLATE_QUERY = gql`
    {
      projectTemplate(id: "${projectTemplateId}"){
        id
        headerImage
        departments {
          id
          titleMultiloc {
            ${graphQLLocale}
          }
        }
        participationLevels {
          id
          titleMultiloc {
            ${graphQLLocale}
          }
        }
        purposes {
          id
          titleMultiloc {
            ${graphQLLocale}
          }
        }
        titleMultiloc {
          ${graphQLLocale}
        }
        subtitleMultiloc {
          ${graphQLLocale}
        }
        descriptionMultilocs {
          content
          locale
        }
        successCases {
          id
          href
          image
        }
      }
    }
  `;

  /*
  "projectTemplate": {
    "id": "fe2923ef-cbf4-44b6-894f-82145d5566df",
    "headerImage": "http://localhost:5001/rails/active_storage/representations/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBCdz09IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--fd5fa014b1f562850827ff575450ba5ac7f88c0a/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdCam9UY21WemFYcGxYM1J2WDJacGJHeGJCMmtDaEFOcEFnUUIiLCJleHAiOm51bGwsInB1ciI6InZhcmlhdGlvbiJ9fQ==--02e9050b019b1cfc3a1ee1031bb943fabb902b22/project_template_header_1.png",
    "departments": [
      {
        "id": "23db4556-7b79-4e62-9990-22c25573cbbc",
        "titleMultiloc": {
          "en": "Mobility",
          "__typename": "Multiloc"
        },
        "__typename": "Department"
      }
    ],
    "participationLevels": [
      {
        "id": "a94ef897-48a9-48d5-8e74-a4f6f6f9b056",
        "titleMultiloc": {
          "en": "Inform",
          "__typename": "Multiloc"
        },
        "__typename": "ParticipationLevel"
      },
      {
        "id": "3e3d8eb1-0e1f-4b47-9156-134f9e6c1f53",
        "titleMultiloc": {
          "en": "Involve",
          "__typename": "Multiloc"
        },
        "__typename": "ParticipationLevel"
      }
    ],
    "purposes": [
      {
        "id": "254f38bb-5bc9-4eff-b2f9-6acdcf91cf90",
        "titleMultiloc": {
          "en": "Engaging citizens",
          "__typename": "Multiloc"
        },
        "__typename": "Purpose"
      }
    ],
    "titleMultiloc": {
      "en": "Mobility survey",
      "__typename": "Multiloc"
    },
    "subtitleMultiloc": {
      "en": "Question citizens on a specific mobility proposal",
      "__typename": "Multiloc"
    },
    "descriptionMultilocs": [
      {
        "content": "<div class=\"trix-content\">\n  monoplast uncompassionate parasubstituted Trionychidae Fatimid Discoplacentalia aggrade heterologically gharnao neurilemmatous pseudometamerism pterygoquadrate timberyard tagwerk yuzluk overjoyful cluttery unfostered counterreply orphanhood cob imperfectious handiwork Sufiism\n</div>\n",
        "locale": "en",
        "__typename": "RichMultiloc"
      }
    ],
    "successCases": [
      {
        "id": "50d4ba57-47ad-4ed9-9f25-e1e7db949e1a",
        "href": "https://www.citizenlab.co",
        "image": "http://localhost:5001/rails/active_storage/representations/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBDQT09IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--ffc2453ed528cdae871a711a06b595eca1ecefd5/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdCam9UY21WemFYcGxYM1J2WDJacGJHeGJCMmxwYVRjPSIsImV4cCI6bnVsbCwicHVyIjoidmFyaWF0aW9uIn19--49b653362b9b1dd2d26a8ae723493a3581e3a0d9/success_case_image_1.png",
        "__typename": "SuccessCase"
      },
      {
        "id": "87b54854-08be-4998-b8e2-bfb1cf0ea25e",
        "href": "https://www.citizenlab.co",
        "image": "http://localhost:5001/rails/active_storage/representations/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBDUT09IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--b41ec19417a5ba81d0eb41aeafccb243b02d1b58/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdCam9UY21WemFYcGxYM1J2WDJacGJHeGJCMmxwYVRjPSIsImV4cCI6bnVsbCwicHVyIjoidmFyaWF0aW9uIn19--49b653362b9b1dd2d26a8ae723493a3581e3a0d9/success_case_image_1.png",
        "__typename": "SuccessCase"
      }
    ],
    "__typename": "ProjectTemplate"
  }
  */

  const { loading, data } = useQuery(TEMPLATE_QUERY);

  const goBack = useCallback(() => {
    // empty
  }, []);

  const useTemplate = useCallback(() => {
    // empty
  }, []);

  if (!loading && data) {
    return (
      <Container className={className}>
        {/* {adminPage &&
          <AdminHeader>
            <Button onClick={goBack}>Go back to templates overview</Button>
            <Button onClick={useTemplate}>Use template</Button>
          </AdminHeader>
        } */}
        <h1>${data.projectTemplate.id}</h1>
      </Container>
    );
  }

  return null;
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
