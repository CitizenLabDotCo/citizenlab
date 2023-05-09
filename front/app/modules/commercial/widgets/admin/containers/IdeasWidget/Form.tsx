import React, { useState } from 'react';

// Components
import { Section, SectionField } from 'components/admin/Section';
import { Label } from '@citizenlab/cl2-component-library';
import Collapse from 'components/UI/Collapse';

// form
import { useFormContext } from 'react-hook-form';
import Toggle from 'components/HookForm/Toggle';
import Select from 'components/HookForm/Select';
import MultipleSelect from 'components/HookForm/MultipleSelect';
import Input from 'components/HookForm/Input';
import ColorPicker from 'components/HookForm/ColorPicker';
import Feedback from 'components/HookForm/Feedback';

// I18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../../messages';

// Resources
import GetTopics from 'resources/GetTopics';
import GetProjects from 'resources/GetProjects';

// Utils
import { isNilOrError } from 'utils/helperUtils';

// Styling
import styled from 'styled-components';
import useLocalize from 'hooks/useLocalize';

// typings
import { IProjectData } from 'api/projects/types';

const StyledCollapse = styled(Collapse)`
  flex: 1;
  width: 100%;
  margin-top: 10px;
  margin-bottom: 10px;
`;

const StyledSection = styled(Section)`
  width: 100%;
  max-width: 500px;
  padding: 20px;
  border-radius: ${(props) => props.theme.borderRadius};
  border: solid 1px #ddd;
  background: #fff;
`;

export interface FormValues {
  width: number;
  height: number;
  siteBgColor: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  font: string | null;
  fontSize: number;
  relativeLink: string;
  showHeader: boolean;
  showLogo: boolean;
  headerText: string;
  headerSubText: string;
  showFooter: boolean;
  buttonText: string;
  sort: 'trending' | 'popular' | 'newest';
  topics: string[];
  projects: string[];
  limit: number;
}

const WidgetForm = () => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const methods = useFormContext();
  const [openedCollapse, setOpenedCollapse] = useState<
    'dimensions' | 'ideas' | 'style' | 'headerAndFooter' | null
  >(null);

  const resourcesToOptionList = (resources) => {
    return (
      resources &&
      resources.map((resource) => ({
        label: localize(resource.attributes.title_multiloc),
        value: resource.id,
      }))
    );
  };

  const sortOptions = () => {
    return [
      {
        value: 'trending',
        label: formatMessage(messages.sortTrending),
      },
      {
        value: 'popular',
        label: formatMessage(messages.sortPopular),
      },
      {
        value: 'new',
        label: formatMessage(messages.sortNewest),
      },
    ];
  };

  const relativeLinkOptions = (projects?: IProjectData[] | null) => {
    return [
      {
        value: '/',
        label: formatMessage(messages.homepage),
      },
      ...(!projects
        ? []
        : projects.map((project) => ({
            value: `/projects/${project.attributes.slug}`,
            label: localize(project.attributes.title_multiloc),
          }))),
    ];
  };

  const handleCollapseToggle = (collapse) => () => {
    setOpenedCollapse(openedCollapse === collapse ? null : collapse);
  };

  return (
    <>
      <StyledCollapse
        opened={openedCollapse === 'dimensions'}
        onToggle={handleCollapseToggle('dimensions')}
        label={<FormattedMessage {...messages.titleDimensions} />}
      >
        <StyledSection>
          <SectionField>
            <Feedback />
          </SectionField>
          <SectionField>
            <Input
              name="width"
              type="number"
              label={formatMessage(messages.fieldWidth)}
            />
          </SectionField>
          <SectionField>
            <Input
              name="height"
              type="number"
              label={formatMessage(messages.fieldHeight)}
            />
          </SectionField>

          <SectionField>
            <Input
              name="fontSize"
              type="number"
              label={formatMessage(messages.fieldFontSize)}
            />
          </SectionField>
        </StyledSection>
      </StyledCollapse>

      <StyledCollapse
        opened={openedCollapse === 'style'}
        onToggle={handleCollapseToggle('style')}
        label={<FormattedMessage {...messages.titleStyle} />}
      >
        <StyledSection>
          <SectionField>
            <Label htmlFor="siteBgColor">
              <FormattedMessage {...messages.fieldSiteBackgroundColor} />
            </Label>
            <ColorPicker name="siteBgColor" />
          </SectionField>
          <SectionField>
            <Label htmlFor="bgColor">
              <FormattedMessage {...messages.fieldBackgroundColor} />
            </Label>
            <ColorPicker name="bgColor" />
          </SectionField>
          <SectionField>
            <Label htmlFor="textColor">
              <FormattedMessage {...messages.fieldTextColor} />
            </Label>
            <ColorPicker name="textColor" />
          </SectionField>
          <SectionField>
            <Label htmlFor="accentColor">
              <FormattedMessage {...messages.fieldAccentColor} />
            </Label>
            <ColorPicker name="accentColor" />
          </SectionField>
          <SectionField>
            <Label>
              <FormattedMessage {...messages.fieldFont} />
            </Label>
            <Input name="font" type="text" />
            <p>
              <FormattedMessage
                {...messages.fieldFontDescription}
                values={{
                  googleFontsLink: (
                    <a
                      href="https://fonts.google.com"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Google Fonts
                    </a>
                  ),
                }}
              />
            </p>
          </SectionField>
        </StyledSection>
      </StyledCollapse>

      <StyledCollapse
        opened={openedCollapse === 'headerAndFooter'}
        onToggle={handleCollapseToggle('headerAndFooter')}
        label={<FormattedMessage {...messages.titleHeaderAndFooter} />}
      >
        <>
          <StyledSection>
            <SectionField>
              <Label>
                <FormattedMessage {...messages.fieldRelativeLink} />
              </Label>
              <GetProjects publicationStatuses={['published', 'archived']}>
                {(projects) =>
                  projects && isNilOrError(projects) ? null : (
                    <Select
                      name="relativeLink"
                      options={relativeLinkOptions(projects)}
                      disabled={
                        !methods.getValues('showHeader') &&
                        !methods.getValues('showFooter')
                      }
                    />
                  )
                }
              </GetProjects>
            </SectionField>
            <SectionField>
              <Toggle
                name="showHeader"
                label={<FormattedMessage {...messages.fieldShowHeader} />}
              />
            </SectionField>
            {methods.getValues('showHeader') && (
              <Section>
                <SectionField>
                  <Toggle
                    name="showLogo"
                    label={<FormattedMessage {...messages.fieldShowLogo} />}
                  />
                </SectionField>
                <SectionField>
                  <Input
                    type="text"
                    name="headerText"
                    label={<FormattedMessage {...messages.fieldHeaderText} />}
                  />
                </SectionField>
                <SectionField>
                  <Input
                    type="text"
                    name="headerSubText"
                    label={
                      <FormattedMessage {...messages.fieldHeaderSubText} />
                    }
                  />
                </SectionField>
              </Section>
            )}
          </StyledSection>
          <StyledSection>
            <SectionField>
              <Toggle
                name="showFooter"
                label={<FormattedMessage {...messages.fieldShowFooter} />}
              />
            </SectionField>
            {methods.getValues('showFooter') && (
              <Section>
                <SectionField>
                  <Input
                    type="text"
                    label={<FormattedMessage {...messages.fieldButtonText} />}
                    name="buttonText"
                  />
                </SectionField>
              </Section>
            )}
          </StyledSection>
        </>
      </StyledCollapse>

      <StyledCollapse
        opened={openedCollapse === 'ideas'}
        onToggle={handleCollapseToggle('ideas')}
        label={<FormattedMessage {...messages.titleInputSelection} />}
      >
        <StyledSection>
          <SectionField>
            <Label htmlFor="projects">
              <FormattedMessage {...messages.fieldProjects} />
            </Label>
            <GetProjects publicationStatuses={['published', 'archived']}>
              {(projects) =>
                projects && isNilOrError(projects) ? null : (
                  <MultipleSelect
                    name="projects"
                    options={resourcesToOptionList(projects)}
                  />
                )
              }
            </GetProjects>
          </SectionField>
          <SectionField>
            <Label htmlFor="topics">
              <FormattedMessage {...messages.fieldTopics} />
            </Label>
            <GetTopics>
              {(topics) =>
                topics && isNilOrError(topics) ? null : (
                  <MultipleSelect
                    name="topics"
                    options={resourcesToOptionList(topics)}
                  />
                )
              }
            </GetTopics>
          </SectionField>
          <SectionField>
            <Select
              name="sort"
              label={<FormattedMessage {...messages.fieldSort} />}
              options={sortOptions()}
            />
          </SectionField>
          <SectionField>
            <Input
              type="number"
              label={<FormattedMessage {...messages.fieldInputsLimit} />}
              name="limit"
            />
          </SectionField>
        </StyledSection>
      </StyledCollapse>
    </>
  );
};

export default WidgetForm;
