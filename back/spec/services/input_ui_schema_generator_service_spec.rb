# frozen_string_literal: true

require 'rails_helper'

# Note that projects and phases in the tests are created with an input_term,
# while their value is irrelevant. After all, the input_term is an argument
# when creating an instance of the described class. To express the irrelevance,
# the input_term for created projects and phases is different from the input_term
# passed when creating an instance of the described class.

RSpec.describe InputUiSchemaGeneratorService do
  subject(:generator) { described_class.new input_term }

  let(:input_term) { 'question' }
  let(:field_key) { 'field_key' }

  describe '#generate_for' do
    context 'for project with a built-in field and an extra field' do
      let(:input_term) { 'contribution' }
      let(:project) { create :continuous_project, input_term: 'issue' }
      let(:custom_form) { create :custom_form, participation_context: project }
      let(:field1) do
        create(
          :custom_field,
          :for_custom_form,
          resource: custom_form,
          input_type: 'text',
          title_multiloc: { 'en' => 'Text title', 'fr-FR' => 'Text titre', 'nl-NL' => 'Text titel' },
          description_multiloc: { 'en' => 'Text description' }
        )
      end
      let(:field2) do
        create(
          :custom_field,
          :for_custom_form,
          resource: custom_form,
          input_type: 'html_multiloc',
          code: 'body_multiloc',
          title_multiloc: {
            'en' => 'Body multiloc field title',
            'nl-NL' => 'Body multiloc veldtitel'
            # No 'fr-FR' to describe that it will default to 'en'.
          },
          description_multiloc: {
            'en' => 'Body multiloc field description',
            'nl-NL' => 'Body multiloc veldbeschrijving'
            # No 'fr-FR' to describe that it will default to 'en'.
          }
        )
      end

      it 'returns the schema for the given fields' do
        expect(generator.generate_for([field1, field2])).to eq({
          'en' => {
            type: 'Categorization',
            options: {
              formId: 'idea-form',
              inputTerm: 'contribution'
            },
            elements: [
              {
                type: 'Category',
                label: I18n.t('custom_forms.categories.main_content.contribution.title', locale: 'en'),
                options: { id: 'mainContent' },
                elements: [
                  {
                    type: 'VerticalLayout',
                    options: { input_type: field2.input_type, render: 'multiloc' },
                    elements: [
                      {
                        type: 'Control',
                        scope: "#/properties/#{field2.key}/properties/en",
                        label: 'Body multiloc field title',
                        options: {
                          description: 'Body multiloc field description',
                          isAdminField: false,
                          hasRule: false,
                          render: 'WYSIWYG',
                          locale: 'en'
                        }
                      },
                      {
                        type: 'Control',
                        scope: "#/properties/#{field2.key}/properties/fr-FR",
                        label: 'Body multiloc field title',
                        options: {
                          description: 'Body multiloc field description',
                          isAdminField: false,
                          hasRule: false,
                          render: 'WYSIWYG',
                          locale: 'fr-FR'
                        }
                      },
                      {
                        type: 'Control',
                        scope: "#/properties/#{field2.key}/properties/nl-NL",
                        label: 'Body multiloc field title',
                        options: {
                          description: 'Body multiloc field description',
                          isAdminField: false,
                          hasRule: false,
                          render: 'WYSIWYG',
                          locale: 'nl-NL'
                        }
                      }
                    ]
                  }
                ]
              },
              {
                type: 'Category',
                options: { id: 'extra' },
                label: I18n.t('custom_forms.categories.extra.title', locale: 'en'),
                elements: [
                  {
                    type: 'Control',
                    scope: "#/properties/#{field1.key}",
                    label: 'Text title',
                    options: {
                      input_type: field1.input_type,
                      description: 'Text description',
                      isAdminField: false,
                      hasRule: false,
                      transform: 'trim_on_blur'
                    }
                  }
                ]
              }
            ]
          },
          'fr-FR' => {
            type: 'Categorization',
            options: {
              formId: 'idea-form',
              inputTerm: 'contribution'
            },
            elements: [
              {
                type: 'Category',
                label: I18n.t('custom_forms.categories.main_content.contribution.title', locale: 'fr-FR'),
                options: { id: 'mainContent' },
                elements: [
                  {
                    type: 'VerticalLayout',
                    options: { input_type: field2.input_type, render: 'multiloc' },
                    elements: [
                      {
                        type: 'Control',
                        scope: "#/properties/#{field2.key}/properties/en",
                        label: 'Body multiloc field title',
                        options: {
                          description: 'Body multiloc field description',
                          isAdminField: false,
                          hasRule: false,
                          render: 'WYSIWYG',
                          locale: 'en'
                        }
                      },
                      {
                        type: 'Control',
                        scope: "#/properties/#{field2.key}/properties/fr-FR",
                        label: 'Body multiloc field title',
                        options: {
                          description: 'Body multiloc field description',
                          isAdminField: false,
                          hasRule: false,
                          render: 'WYSIWYG',
                          locale: 'fr-FR'
                        }
                      },
                      {
                        type: 'Control',
                        scope: "#/properties/#{field2.key}/properties/nl-NL",
                        label: 'Body multiloc field title',
                        options: {
                          description: 'Body multiloc field description',
                          isAdminField: false,
                          hasRule: false,
                          render: 'WYSIWYG',
                          locale: 'nl-NL'
                        }
                      }
                    ]
                  }
                ]
              },
              {
                type: 'Category',
                options: { id: 'extra' },
                label: I18n.t('custom_forms.categories.extra.title', locale: 'fr-FR'),
                elements: [
                  {
                    type: 'Control',
                    scope: "#/properties/#{field1.key}",
                    label: 'Text titre',
                    options: {
                      input_type: field1.input_type,
                      description: 'Text description',
                      isAdminField: false,
                      hasRule: false,
                      transform: 'trim_on_blur'
                    }
                  }
                ]
              }
            ]
          },
          'nl-NL' => {
            type: 'Categorization',
            options: {
              formId: 'idea-form',
              inputTerm: 'contribution'
            },
            elements: [
              {
                type: 'Category',
                label: I18n.t('custom_forms.categories.main_content.contribution.title', locale: 'nl-NL'),
                options: { id: 'mainContent' },
                elements: [
                  {
                    type: 'VerticalLayout',
                    options: { input_type: field2.input_type, render: 'multiloc' },
                    elements: [
                      {
                        type: 'Control',
                        scope: "#/properties/#{field2.key}/properties/en",
                        label: 'Body multiloc veldtitel',
                        options: {
                          description: 'Body multiloc veldbeschrijving',
                          isAdminField: false,
                          hasRule: false,
                          render: 'WYSIWYG',
                          locale: 'en'
                        }
                      },
                      {
                        type: 'Control',
                        scope: "#/properties/#{field2.key}/properties/fr-FR",
                        label: 'Body multiloc veldtitel',
                        options: {
                          description: 'Body multiloc veldbeschrijving',
                          isAdminField: false,
                          hasRule: false,
                          render: 'WYSIWYG',
                          locale: 'fr-FR'
                        }
                      },
                      {
                        type: 'Control',
                        scope: "#/properties/#{field2.key}/properties/nl-NL",
                        label: 'Body multiloc veldtitel',
                        options: {
                          description: 'Body multiloc veldbeschrijving',
                          isAdminField: false,
                          hasRule: false,
                          render: 'WYSIWYG',
                          locale: 'nl-NL'
                        }
                      }
                    ]
                  }
                ]
              },
              {
                type: 'Category',
                options: { id: 'extra' },
                label: I18n.t('custom_forms.categories.extra.title', locale: 'nl-NL'),
                elements: [
                  {
                    type: 'Control',
                    scope: "#/properties/#{field1.key}",
                    label: 'Text titel',
                    options: {
                      input_type: field1.input_type,
                      description: 'Text description',
                      isAdminField: false,
                      hasRule: false,
                      transform: 'trim_on_blur'
                    }
                  }
                ]
              }
            ]
          }
        })
      end
    end

    context 'for a continuous ideation project' do
      let(:input_term) { 'option' }
      let(:project) { create(:continuous_project, input_term: 'issue') }
      let(:continuous_fields) do
        IdeaCustomFieldsService.new(
          create(:custom_form, participation_context: project)
        ).all_fields
      end

      it 'uses the right input_term' do
        ui_schema = generator.generate_for(continuous_fields)['en']
        expect(ui_schema.dig(:options, :inputTerm)).to eq 'option'
      end

      context 'when a nil input_term is given' do
        let(:input_term) { nil }

        it 'uses the default "idea" as input_term' do
          ui_schema = generator.generate_for(continuous_fields)['en']
          expect(ui_schema.dig(:options, :inputTerm)).to eq 'idea'
        end
      end

      it 'does not include the details category when there are no fields inside' do
        disabled_codes = %w[proposed_budget budget topic_ids location_description]
        enabled_fields = continuous_fields.reject do |field|
          disabled_codes.include?(field.code)
        end
        ui_schema = generator.generate_for(enabled_fields)['en']
        expect(ui_schema[:elements].any? { |e| e[:options][:id] == 'details' }).to be false
        expect(ui_schema[:elements].any? { |e| e[:options][:id] == 'mainContent' }).to be true
      end

      it 'does not include the images and attachments category when there are no fields inside' do
        disabled_codes = %w[idea_images_attributes idea_files_attributes]
        enabled_fields = continuous_fields.reject do |field|
          disabled_codes.include?(field.code)
        end
        ui_schema = generator.generate_for(enabled_fields)['en']
        expect(ui_schema[:elements].any? { |e| e[:options][:id] == 'attachments' }).to be false
        expect(ui_schema[:elements].any? { |e| e[:options][:id] == 'mainContent' }).to be true
      end

      it 'does not include an extra category when there are only built-in fields' do
        ui_schema = generator.generate_for(continuous_fields)['en']
        expect(ui_schema[:elements].any? { |e| e[:options][:id] == 'extra' }).to be false
        expect(ui_schema[:elements].any? { |e| e[:options][:id] == 'mainContent' }).to be true
      end

      it 'includes all non built-in fields in an extra category' do
        continuous_fields.push(create(:custom_field_extra_custom_form, resource: project.custom_form))
        ui_schema = generator.generate_for(continuous_fields)['en']
        expect(ui_schema[:elements].any? { |e| e[:options][:id] == 'extra' }).to be true
        expect(ui_schema[:elements].find { |e| e[:options][:id] == 'extra' }[:elements].size).to eq 1
        expect(ui_schema[:elements].any? { |e| e[:options][:id] == 'mainContent' }).to be true
      end

      it 'gives all non built-in fields a nested path' do
        continuous_fields.push(create(:custom_field_extra_custom_form, resource: project.custom_form))
        ui_schema = generator.generate_for(continuous_fields)['en']
        expect(ui_schema[:elements].find { |e| e[:options][:id] == 'extra' }[:elements].size).to eq 1
        expect(ui_schema[:elements].find { |e| e[:options][:id] == 'extra' }[:elements].first[:scope]).to eq '#/properties/extra_field'
      end
    end

    context 'for a continuous native survey project without pages' do
      let(:project) { create(:continuous_native_survey_project) }
      let(:form) { create :custom_form, participation_context: project }
      let!(:field) { create :custom_field, resource: form }

      it 'has an empty extra category label, so that the category label is suppressed in the UI' do
        en_ui_schema = generator.generate_for([field])['en']
        expect(en_ui_schema).to eq({
          type: 'Categorization',
          options: {
            formId: 'idea-form',
            inputTerm: input_term
          },
          elements: [{
            type: 'Category',
            label: nil,
            options: { id: 'extra' },
            elements: [{
              type: 'Control',
              scope: "#/properties/#{field.key}",
              label: 'Did you attend',
              options: {
                input_type: field.input_type,
                description: 'Which councils are you attending in our city?',
                isAdminField: false,
                hasRule: false,
                transform: 'trim_on_blur'
              }
            }]
          }]
        })
      end
    end

    context 'for a continuous native survey project with pages' do
      let(:project) { create(:continuous_native_survey_project) }
      let(:form) { create :custom_form, participation_context: project }
      let!(:page1) do
        create(
          :custom_field_page,
          resource: form,
          key: 'about_you',
          title_multiloc: { 'en' => 'About you' },
          description_multiloc: { 'en' => 'Please fill in some <strong>personal details</strong>.' }
        )
      end
      let!(:field_in_page1) do
        create(
          :custom_field,
          resource: form,
          key: 'what_is_your_age',
          title_multiloc: { 'en' => 'What is your age?' },
          description_multiloc: { 'en' => 'Enter a number.' }
        )
      end
      let!(:page2) do
        create(
          :custom_field_page,
          resource: form,
          key: 'about_your_cycling_habits',
          title_multiloc: { 'en' => 'About your cycling habits' },
          description_multiloc: { 'en' => 'Please indicate how you use <strong>a bike</strong>.' }
        )
      end
      let!(:field_in_page2) do
        create(
          :custom_field,
          resource: form,
          key: 'do_you_own_a_bike',
          title_multiloc: { 'en' => 'Do you own a bike?' },
          description_multiloc: { 'en' => 'Enter Yes or No.' }
        )
      end
      let!(:page3) do
        create(
          :custom_field_page,
          resource: form,
          key: 'this_is_the_end_of_the_survey',
          title_multiloc: { 'en' => 'This is the end of the survey' },
          description_multiloc: { 'en' => 'Thank you for participating 🚀' }
        )
      end

      it 'has a category for each page, including the fixed survey end page' do
        en_ui_schema = generator.generate_for([page1, field_in_page1, page2, field_in_page2, page3])['en']
        expect(en_ui_schema).to eq({
          type: 'Categorization',
          options: {
            formId: 'idea-form',
            inputTerm: 'idea'
          },
          elements: [
            {
              type: 'Page',
              options: {
                input_type: page1.input_type,
                id: page1.id,
                title: 'About you',
                description: 'Please fill in some <strong>personal details</strong>.'
              },
              elements: [{
                type: 'Control',
                scope: "#/properties/#{field_in_page1.key}",
                label: 'What is your age?',
                options: {
                  input_type: field_in_page1.input_type,
                  description: 'Enter a number.',
                  isAdminField: false,
                  hasRule: false,
                  transform: 'trim_on_blur'
                }
              }]
            },
            {
              type: 'Page',
              options: {
                input_type: page2.input_type,
                id: page2.id,
                title: 'About your cycling habits',
                description: 'Please indicate how you use <strong>a bike</strong>.'
              },
              elements: [{
                type: 'Control',
                scope: "#/properties/#{field_in_page2.key}",
                label: 'Do you own a bike?',
                options: {
                  input_type: field_in_page2.input_type,
                  description: 'Enter Yes or No.',
                  isAdminField: false,
                  hasRule: false,
                  transform: 'trim_on_blur'
                }
              }]
            },
            {
              type: 'Page',
              options: {
                input_type: page3.input_type,
                id: page3.id,
                title: 'This is the end of the survey',
                description: 'Thank you for participating 🚀'
              },
              elements: []
            },
            {
              type: 'Page',
              options: {
                id: 'survey_end',
                title: 'Survey end',
                description: "Please submit your answers by selecting 'Submit survey' below."
              },
              elements: []
            }
          ]
        })
      end
    end

    context 'for a continuous native survey project with pages and logic' do
      let(:project) { create(:continuous_native_survey_project) }
      let(:form) { create :custom_form, participation_context: project }
      let!(:page1) do
        create(
          :custom_field_page,
          resource: form,
          key: 'page1',
          title_multiloc: { 'en' => '' },
          description_multiloc: { 'en' => '' }
        )
      end
      let!(:field_in_page1) do
        create(
          :custom_field,
          resource: form,
          input_type: 'linear_scale',
          key: 'how_old_are_you',
          title_multiloc: { 'en' => 'Hold old are you?' },
          description_multiloc: { 'en' => '' },
          maximum: 7,
          logic: {
            rules: [
              {
                if: 1,
                goto_page_id: page3.id
              }
            ]
          }
        )
      end
      let!(:page2) do
        create(
          :custom_field_page,
          resource: form,
          key: 'page2',
          title_multiloc: { 'en' => '' },
          description_multiloc: { 'en' => '' }
        )
      end
      let!(:field_in_page2) do
        create(
          :custom_field,
          resource: form,
          input_type: 'select',
          key: 'how_often_do_you_choose_to_cycle',
          title_multiloc: { 'en' => 'When considering travel near your home, how often do you choose to CYCLE?' },
          description_multiloc: { 'en' => '' }
        )
      end
      let!(:every_day_option) do
        create(:custom_field_option, custom_field: field_in_page2, key: 'every_day', title_multiloc: { 'en' => 'Every day' })
      end
      let!(:never_option) do
        create(:custom_field_option, custom_field: field_in_page2, key: 'never', title_multiloc: { 'en' => 'Never' })
      end
      let!(:page3) do
        create(
          :custom_field_page,
          resource: form,
          key: 'page3',
          title_multiloc: { 'en' => '' },
          description_multiloc: { 'en' => '' }
        )
      end
      let!(:page4) do
        create(
          :custom_field_page,
          resource: form,
          key: 'page4',
          title_multiloc: { 'en' => '' },
          description_multiloc: { 'en' => '' }
        )
      end

      before do
        field_in_page2.update!(logic: {
          rules: [
            {
              if: never_option.id,
              goto_page_id: page4.id
            }
          ]
        })
      end

      it 'includes rules for logic' do
        en_ui_schema = generator.generate_for([page1, field_in_page1, page2, field_in_page2, page3])['en']
        expect(en_ui_schema).to eq({
          type: 'Categorization',
          options: {
            formId: 'idea-form',
            inputTerm: 'idea'
          },
          elements: [
            {
              type: 'Page',
              options: {
                input_type: page1.input_type,
                id: page1.id,
                title: '',
                description: ''
              },
              elements: [{
                type: 'Control',
                scope: "#/properties/#{field_in_page1.key}",
                label: 'Hold old are you?',
                options: {
                  input_type: field_in_page1.input_type,
                  description: '',
                  isAdminField: false,
                  hasRule: true,
                  maximum_label: '',
                  minimum_label: ''
                }
              }]
            },
            {
              type: 'Page',
              options: {
                input_type: page2.input_type,
                id: page2.id,
                title: '',
                description: ''
              },
              elements: [{
                type: 'Control',
                scope: "#/properties/#{field_in_page2.key}",
                label: 'When considering travel near your home, how often do you choose to CYCLE?',
                options: {
                  input_type: field_in_page2.input_type,
                  description: '',
                  isAdminField: false,
                  hasRule: true
                }
              }],
              ruleArray: [
                {
                  effect: 'HIDE',
                  condition: {
                    scope: "#/properties/#{field_in_page1.key}",
                    schema: {
                      enum: [1]
                    }
                  }
                }
              ]
            },
            {
              type: 'Page',
              options: {
                input_type: page3.input_type,
                id: page3.id,
                title: '',
                description: ''
              },
              elements: [],
              ruleArray: [
                {
                  effect: 'HIDE',
                  condition: {
                    scope: "#/properties/#{field_in_page2.key}",
                    schema: {
                      enum: [never_option.key]
                    }
                  }
                }
              ]
            },
            {
              type: 'Page',
              options: {
                id: 'survey_end',
                title: 'Survey end',
                description: "Please submit your answers by selecting 'Submit survey' below."
              },
              elements: []
            }
          ]
        })
      end
    end

    context 'for a timeline project' do
      let(:input_term) { 'contribution' }
      let(:timeline_fields) do
        project_with_current_phase = create(:project_with_current_phase, input_term: 'issue')
        TimelineService.new.current_phase(project_with_current_phase).update!(input_term: 'option')
        IdeaCustomFieldsService.new(create(:custom_form, participation_context: project_with_current_phase)).all_fields
      end

      it 'uses the right input_term' do
        ui_schema = generator.generate_for(timeline_fields)['en']
        expect(ui_schema.dig(:options, :inputTerm)).to eq 'contribution'
      end
    end
  end

  describe '#visit_text' do
    let(:code) { nil }
    let(:field) do
      create(
        :custom_field,
        input_type: 'text',
        code: code,
        key: field_key,
        title_multiloc: { 'en' => 'Text field title' },
        description_multiloc: { 'en-CA' => 'Text field description' }
      )
    end

    context 'for author_id built-in field' do
      let(:code) { 'author_id' }

      it 'returns the schema for the author_id field with isAdminField set to true' do
        expect(generator.visit_text(field)).to eq({
          type: 'Control',
          scope: "#/properties/#{field_key}",
          label: 'Text field title',
          options: {
            input_type: field.input_type,
            description: 'Text field description',
            transform: 'trim_on_blur',
            isAdminField: true,
            hasRule: false
          }
        })
      end
    end

    context 'for other fields' do
      it 'returns the schema for the given field with isAdminField set to false' do
        expect(generator.visit_text(field)).to eq({
          type: 'Control',
          scope: "#/properties/#{field_key}",
          label: 'Text field title',
          options: {
            input_type: field.input_type,
            description: 'Text field description',
            transform: 'trim_on_blur',
            isAdminField: false,
            hasRule: false
          }
        })
      end
    end
  end

  describe '#visit_number' do
    let(:code) { nil }
    let(:field) do
      create(
        :custom_field,
        input_type: 'number',
        code: code,
        key: field_key,
        title_multiloc: { 'en' => 'Number field title' },
        description_multiloc: { 'en' => 'Number field description' }
      )
    end

    context 'for author_id built-in field' do
      let(:code) { 'budget' }

      it 'returns the schema for the budget field with isAdminField set to true' do
        expect(generator.visit_number(field)).to eq({
          type: 'Control',
          scope: "#/properties/#{field_key}",
          label: 'Number field title',
          options: {
            input_type: field.input_type,
            description: 'Number field description',
            isAdminField: true,
            hasRule: false
          }
        })
      end
    end

    context 'for other fields' do
      it 'returns the schema for the given field with isAdminField set to false' do
        expect(generator.visit_number(field)).to eq({
          type: 'Control',
          scope: "#/properties/#{field_key}",
          label: 'Number field title',
          options: {
            input_type: field.input_type,
            description: 'Number field description',
            isAdminField: false,
            hasRule: false
          }
        })
      end
    end
  end

  describe '#visit_html_multiloc' do
    context 'when the code is body_multiloc' do
      let(:field) do
        create(
          :custom_field,
          input_type: 'html_multiloc',
          code: 'body_multiloc',
          key: field_key,
          title_multiloc: {
            'en' => 'Body multiloc field title',
            'nl-NL' => 'Body multiloc veldtitel'
            # No 'fr-FR' to describe that it will default to 'en'.
          },
          description_multiloc: {
            'en' => 'Body multiloc field description',
            'nl-NL' => 'Body multiloc veldbeschrijving'
            # No 'fr-FR' to describe that it will default to 'en'.
          }
        )
      end

      it 'returns the schema for the given built-in field with translations in the current locale' do
        I18n.with_locale('en') do
          expect(generator.visit_html_multiloc(field)).to eq({
            type: 'VerticalLayout',
            options: { input_type: field.input_type, render: 'multiloc' },
            elements: [
              {
                type: 'Control',
                scope: "#/properties/#{field_key}/properties/en",
                label: 'Body multiloc field title',
                options: {
                  description: 'Body multiloc field description',
                  isAdminField: false,
                  hasRule: false,
                  render: 'WYSIWYG',
                  locale: 'en'
                }
              },
              {
                type: 'Control',
                scope: "#/properties/#{field_key}/properties/fr-FR",
                label: 'Body multiloc field title',
                options: {
                  description: 'Body multiloc field description',
                  isAdminField: false,
                  hasRule: false,
                  render: 'WYSIWYG',
                  locale: 'fr-FR'
                }
              },
              {
                type: 'Control',
                scope: "#/properties/#{field_key}/properties/nl-NL",
                label: 'Body multiloc field title',
                options: {
                  description: 'Body multiloc field description',
                  isAdminField: false,
                  hasRule: false,
                  render: 'WYSIWYG',
                  locale: 'nl-NL'
                }
              }
            ]
          })
        end
        I18n.with_locale('fr-FR') do
          expect(generator.visit_html_multiloc(field)).to eq({
            type: 'VerticalLayout',
            options: { input_type: field.input_type, render: 'multiloc' },
            elements: [
              {
                type: 'Control',
                scope: "#/properties/#{field_key}/properties/en",
                label: 'Body multiloc field title',
                options: {
                  description: 'Body multiloc field description',
                  isAdminField: false,
                  hasRule: false,
                  render: 'WYSIWYG',
                  locale: 'en'
                }
              },
              {
                type: 'Control',
                scope: "#/properties/#{field_key}/properties/fr-FR",
                label: 'Body multiloc field title',
                options: {
                  description: 'Body multiloc field description',
                  isAdminField: false,
                  hasRule: false,
                  render: 'WYSIWYG',
                  locale: 'fr-FR'
                }
              },
              {
                type: 'Control',
                scope: "#/properties/#{field_key}/properties/nl-NL",
                label: 'Body multiloc field title',
                options: {
                  description: 'Body multiloc field description',
                  isAdminField: false,
                  hasRule: false,
                  render: 'WYSIWYG',
                  locale: 'nl-NL'
                }
              }
            ]
          })
        end
        I18n.with_locale('nl-NL') do
          expect(generator.visit_html_multiloc(field)).to eq({
            type: 'VerticalLayout',
            options: { input_type: field.input_type, render: 'multiloc' },
            elements: [
              {
                type: 'Control',
                scope: "#/properties/#{field_key}/properties/en",
                label: 'Body multiloc veldtitel',
                options: {
                  description: 'Body multiloc veldbeschrijving',
                  isAdminField: false,
                  hasRule: false,
                  render: 'WYSIWYG',
                  locale: 'en'
                }
              },
              {
                type: 'Control',
                scope: "#/properties/#{field_key}/properties/fr-FR",
                label: 'Body multiloc veldtitel',
                options: {
                  description: 'Body multiloc veldbeschrijving',
                  isAdminField: false,
                  hasRule: false,
                  render: 'WYSIWYG',
                  locale: 'fr-FR'
                }
              },
              {
                type: 'Control',
                scope: "#/properties/#{field_key}/properties/nl-NL",
                label: 'Body multiloc veldtitel',
                options: {
                  description: 'Body multiloc veldbeschrijving',
                  isAdminField: false,
                  hasRule: false,
                  render: 'WYSIWYG',
                  locale: 'nl-NL'
                }
              }
            ]
          })
        end
      end
    end

    context 'when the code is something else' do
      let(:field) do
        create(
          :custom_field,
          input_type: 'html_multiloc',
          key: field_key,
          title_multiloc: { 'en' => 'HTML multiloc field title' },
          description_multiloc: { 'en' => 'HTML multiloc field description' }
        )
      end

      it 'returns the schema for the given field' do
        expect(generator.visit_html_multiloc(field)).to eq({
          type: 'VerticalLayout',
          options: { input_type: field.input_type, render: 'multiloc' },
          elements: [
            {
              type: 'Control',
              scope: "#/properties/#{field_key}/properties/en",
              label: 'HTML multiloc field title',
              options: {
                description: 'HTML multiloc field description',
                isAdminField: false,
                hasRule: false,
                render: 'WYSIWYG',
                trim_on_blur: true,
                locale: 'en'
              }
            },
            {
              type: 'Control',
              scope: "#/properties/#{field_key}/properties/fr-FR",
              label: 'HTML multiloc field title',
              options: {
                description: 'HTML multiloc field description',
                isAdminField: false,
                hasRule: false,
                render: 'WYSIWYG',
                trim_on_blur: true,
                locale: 'fr-FR'
              }
            },
            {
              type: 'Control',
              scope: "#/properties/#{field_key}/properties/nl-NL",
              label: 'HTML multiloc field title',
              options: {
                description: 'HTML multiloc field description',
                isAdminField: false,
                hasRule: false,
                render: 'WYSIWYG',
                trim_on_blur: true,
                locale: 'nl-NL'
              }
            }
          ]
        })
      end
    end
  end

  describe '#visit_page' do
    let(:field) do
      create(
        :custom_field,
        input_type: 'page',
        key: field_key,
        title_multiloc: { 'en' => 'Page field title' },
        description_multiloc: { 'en' => 'Page field description' }
      )
    end

    it 'returns the schema for the given field, with id, and without elements' do
      expect(generator.visit_page(field)).to eq({
        type: 'Page',
        options: {
          input_type: field.input_type,
          id: field.id,
          title: 'Page field title',
          description: 'Page field description'
        },
        elements: []
      })
    end
  end
end
