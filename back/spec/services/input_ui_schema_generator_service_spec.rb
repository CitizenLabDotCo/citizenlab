# frozen_string_literal: true

require 'rails_helper'

RSpec.describe InputUiSchemaGeneratorService do
  subject(:generator) { described_class.new }

  let(:field_key) { 'field_key' }

  describe '#generate_for' do
    context 'for project with a built-in field and an extra field' do
      let(:project) { create :continuous_project, input_term: 'contribution' }
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
          title_multiloc: { 'en' => 'Body multiloc field title' },
          description_multiloc: { 'en' => 'Body multiloc field description' }
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
                    options: { render: 'multiloc' },
                    elements: [
                      {
                        type: 'Control',
                        scope: "#/properties/#{field2.key}/properties/en",
                        label: 'Body multiloc field title',
                        options: {
                          description: 'Body multiloc field description',
                          isAdminField: false,
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
                      description: 'Text description',
                      isAdminField: false,
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
                    options: { render: 'multiloc' },
                    elements: [
                      {
                        type: 'Control',
                        scope: "#/properties/#{field2.key}/properties/en",
                        label: 'Body multiloc field title',
                        options: {
                          description: 'Body multiloc field description',
                          isAdminField: false,
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
                      description: 'Text description',
                      isAdminField: false,
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
                    options: { render: 'multiloc' },
                    elements: [
                      {
                        type: 'Control',
                        scope: "#/properties/#{field2.key}/properties/en",
                        label: 'Body multiloc field title',
                        options: {
                          description: 'Body multiloc field description',
                          isAdminField: false,
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
                      description: 'Text description',
                      isAdminField: false,
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
      let(:project) { create(:continuous_project, input_term: 'option') }
      let(:continuous_fields) do
        IdeaCustomFieldsService.new(
          create(:custom_form, participation_context: project)
        ).all_fields
      end

      it 'uses the right input_term' do
        ui_schema = generator.generate_for(continuous_fields)['en']
        expect(ui_schema.dig(:options, :inputTerm)).to eq 'option'
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

    context 'for a continuous native survey project' do
      let(:project) { create(:continuous_native_survey_project) }
      let(:form) { create :custom_form, participation_context: project }
      let!(:field) { create :custom_field, resource: form }

      it 'has an empty extra category label, so that the category label is suppressed in the UI' do
        en_ui_schema = generator.generate_for([field])['en']
        expect(en_ui_schema).to eq({
          type: 'Categorization',
          options: {
            formId: 'idea-form',
            inputTerm: 'idea'
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
                description: 'Which councils are you attending in our city?',
                isAdminField: false,
                transform: 'trim_on_blur'
              }
            }]
          }]
        })
      end
    end

    context 'for a timeline project' do
      let(:timeline_fields) do
        project_with_current_phase = create(:project_with_current_phase, input_term: 'contribution')
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
            description: 'Text field description',
            transform: 'trim_on_blur',
            isAdminField: true
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
            description: 'Text field description',
            transform: 'trim_on_blur',
            isAdminField: false
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
            description: 'Number field description',
            isAdminField: true
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
            description: 'Number field description',
            isAdminField: false
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
          title_multiloc: { 'en' => 'Body multiloc field title' },
          description_multiloc: { 'en' => 'Body multiloc field description' }
        )
      end

      it 'returns the schema for the given built-in field' do
        expect(generator.visit_html_multiloc(field)).to eq({
          type: 'VerticalLayout',
          options: { render: 'multiloc' },
          elements: [
            {
              type: 'Control',
              scope: "#/properties/#{field_key}/properties/en",
              label: 'Body multiloc field title',
              options: {
                description: 'Body multiloc field description',
                isAdminField: false,
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
                render: 'WYSIWYG',
                locale: 'nl-NL'
              }
            }
          ]
        })
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
          options: { render: 'multiloc' },
          elements: [
            {
              type: 'Control',
              scope: "#/properties/#{field_key}/properties/en",
              label: 'HTML multiloc field title',
              options: {
                description: 'HTML multiloc field description',
                isAdminField: false,
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
end
