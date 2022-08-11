# frozen_string_literal: true

require 'rails_helper'

RSpec.describe InputUiSchemaGeneratorService do
  subject(:generator) { described_class.new }

  let(:field_key) { 'field_key' }

  describe '#generate_for' do
    let(:project) { create :continuous_project, input_term: 'contribution' }
    let(:custom_form) { create :custom_form, project: project }
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
                      options: { description: 'Body multiloc field description', render: 'WYSIWYG', locale: 'en' }
                    },
                    {
                      type: 'Control',
                      scope: "#/properties/#{field2.key}/properties/fr-FR",
                      label: 'Body multiloc field title',
                      options: { description: 'Body multiloc field description', render: 'WYSIWYG', locale: 'fr-FR' }
                    },
                    {
                      type: 'Control',
                      scope: "#/properties/#{field2.key}/properties/nl-NL",
                      label: 'Body multiloc field title',
                      options: { description: 'Body multiloc field description', render: 'WYSIWYG', locale: 'nl-NL' }
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
                  options: { description: 'Text description', transform: 'trim_on_blur' }
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
                      options: { description: 'Body multiloc field description', render: 'WYSIWYG', locale: 'en' }
                    },
                    {
                      type: 'Control',
                      scope: "#/properties/#{field2.key}/properties/fr-FR",
                      label: 'Body multiloc field title',
                      options: { description: 'Body multiloc field description', render: 'WYSIWYG', locale: 'fr-FR' }
                    },
                    {
                      type: 'Control',
                      scope: "#/properties/#{field2.key}/properties/nl-NL",
                      label: 'Body multiloc field title',
                      options: { description: 'Body multiloc field description', render: 'WYSIWYG', locale: 'nl-NL' }
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
                  options: { description: 'Text description', transform: 'trim_on_blur' }
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
                      options: { description: 'Body multiloc field description', render: 'WYSIWYG', locale: 'en' }
                    },
                    {
                      type: 'Control',
                      scope: "#/properties/#{field2.key}/properties/fr-FR",
                      label: 'Body multiloc field title',
                      options: { description: 'Body multiloc field description', render: 'WYSIWYG', locale: 'fr-FR' }
                    },
                    {
                      type: 'Control',
                      scope: "#/properties/#{field2.key}/properties/nl-NL",
                      label: 'Body multiloc field title',
                      options: { description: 'Body multiloc field description', render: 'WYSIWYG', locale: 'nl-NL' }
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
                  options: { description: 'Text description', transform: 'trim_on_blur' }
                }
              ]
            }
          ]
        }
      })
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
              options: { description: 'Body multiloc field description', render: 'WYSIWYG', locale: 'en' }
            },
            {
              type: 'Control',
              scope: "#/properties/#{field_key}/properties/fr-FR",
              label: 'Body multiloc field title',
              options: { description: 'Body multiloc field description', render: 'WYSIWYG', locale: 'fr-FR' }
            },
            {
              type: 'Control',
              scope: "#/properties/#{field_key}/properties/nl-NL",
              label: 'Body multiloc field title',
              options: { description: 'Body multiloc field description', render: 'WYSIWYG', locale: 'nl-NL' }
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
              options: { description: 'HTML multiloc field description', render: 'WYSIWYG', trim_on_blur: true, locale: 'en' }
            },
            {
              type: 'Control',
              scope: "#/properties/#{field_key}/properties/fr-FR",
              label: 'HTML multiloc field title',
              options: { description: 'HTML multiloc field description', render: 'WYSIWYG', trim_on_blur: true, locale: 'fr-FR' }
            },
            {
              type: 'Control',
              scope: "#/properties/#{field_key}/properties/nl-NL",
              label: 'HTML multiloc field title',
              options: { description: 'HTML multiloc field description', render: 'WYSIWYG', trim_on_blur: true, locale: 'nl-NL' }
            }
          ]
        })
      end
    end
  end
end
