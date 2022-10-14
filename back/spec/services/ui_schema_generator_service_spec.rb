# frozen_string_literal: true

require 'rails_helper'

class UiSchemaGeneratorServiceSubclass < UiSchemaGeneratorService
  def generate_for_current_locale(fields)
    {
      elements: fields.map { |field| visit field }
    }
  end
end

RSpec.describe UiSchemaGeneratorService do
  subject(:generator) { described_class.new }

  let(:field_key) { 'field_key' }

  describe '#generate_for' do
    let(:field1) do
      create(
        :custom_field,
        input_type: 'text',
        title_multiloc: { 'en' => 'Field1 title', 'fr-FR' => 'Field1 titre', 'nl-NL' => 'Field1 titel' },
        description_multiloc: { 'en' => 'Field1 description' }
      )
    end
    let(:field2) do
      create(
        :custom_field_select,
        :with_options,
        input_type: 'select',
        title_multiloc: { 'en' => 'Field2 title', 'fr-FR' => 'Field2 titre', 'nl-NL' => 'Field2 titel' },
        description_multiloc: { 'en' => 'Field2 description' }
      )
    end

    it 'returns the schema for the given fields' do
      expect(UiSchemaGeneratorServiceSubclass.new.generate_for([field1, field2])).to eq({
        'en' => {
          elements: [
            {
              type: 'Control',
              scope: "#/properties/#{field1.key}",
              label: 'Field1 title',
              options: { description: 'Field1 description', transform: 'trim_on_blur' }
            },
            {
              type: 'Control',
              scope: "#/properties/#{field2.key}",
              label: 'Field2 title',
              options: { description: 'Field2 description' }
            }
          ]
        },
        'fr-FR' => {
          elements: [
            {
              type: 'Control',
              scope: "#/properties/#{field1.key}",
              label: 'Field1 titre',
              options: { description: 'Field1 description', transform: 'trim_on_blur' }
            },
            {
              type: 'Control',
              scope: "#/properties/#{field2.key}",
              label: 'Field2 titre',
              options: { description: 'Field2 description' }
            }
          ]
        },
        'nl-NL' => {
          elements: [
            {
              type: 'Control',
              scope: "#/properties/#{field1.key}",
              label: 'Field1 titel',
              options: { description: 'Field1 description', transform: 'trim_on_blur' }
            },
            {
              type: 'Control',
              scope: "#/properties/#{field2.key}",
              label: 'Field2 titel',
              options: { description: 'Field2 description' }
            }
          ]
        }
      })
    end
  end

  describe '#visit_text' do
    let(:field) do
      create(
        :custom_field,
        input_type: 'text',
        key: field_key,
        title_multiloc: { 'en' => 'Text field title' },
        description_multiloc: { 'en-CA' => 'Text field description' }
      )
    end

    it 'returns the schema for the given field' do
      expect(generator.visit_text(field)).to eq({
        type: 'Control',
        scope: "#/properties/#{field_key}",
        label: 'Text field title',
        options: { description: 'Text field description', transform: 'trim_on_blur' }
      })
    end
  end

  describe '#visit_number' do
    let(:field) do
      create(
        :custom_field,
        input_type: 'number',
        key: field_key,
        title_multiloc: { 'en' => 'Number field title' },
        description_multiloc: { 'en' => 'Number field description' }
      )
    end

    it 'returns the schema for the given field' do
      expect(generator.visit_number(field)).to eq({
        type: 'Control',
        scope: "#/properties/#{field_key}",
        label: 'Number field title',
        options: { description: 'Number field description' }
      })
    end
  end

  describe '#visit_multiline_text' do
    let(:field) do
      create(
        :custom_field,
        input_type: 'multiline_text',
        key: field_key,
        title_multiloc: { 'en' => 'Multiline field title' },
        description_multiloc: { 'en' => 'Multiline field description' }
      )
    end

    it 'returns the schema for the given field' do
      expect(generator.visit_multiline_text(field)).to eq({
        type: 'Control',
        scope: "#/properties/#{field_key}",
        label: 'Multiline field title',
        options: { description: 'Multiline field description', textarea: true, transform: 'trim_on_blur' }
      })
    end
  end

  describe '#visit_html' do
    let(:field) do
      create(
        :custom_field,
        input_type: 'html',
        key: field_key,
        title_multiloc: { 'en' => 'HTML field title' },
        description_multiloc: { 'en' => 'HTML field description' }
      )
    end

    it 'returns the schema for the given field' do
      expect(generator.visit_html(field)).to eq({
        type: 'Control',
        scope: "#/properties/#{field_key}",
        label: 'HTML field title',
        options: { description: 'HTML field description', render: 'WYSIWYG' }
      })
    end
  end

  describe '#visit_text_multiloc' do
    let(:field) do
      create(
        :custom_field,
        input_type: 'text_multiloc',
        key: field_key,
        title_multiloc: { 'en' => 'Text multiloc field title', 'fr-FR' => 'Titre du champ de texte multiloc' },
        description_multiloc: { 'en' => 'Text multiloc field description' }
      )
    end

    it 'returns the schema for the given field' do
      expect(generator.visit_text_multiloc(field)).to eq({
        type: 'VerticalLayout',
        options: { render: 'multiloc' },
        elements: [
          {
            type: 'Control',
            scope: "#/properties/#{field_key}/properties/en",
            label: 'Text multiloc field title',
            options: { description: 'Text multiloc field description', trim_on_blur: true, locale: 'en' }
          },
          {
            type: 'Control',
            scope: "#/properties/#{field_key}/properties/fr-FR",
            label: 'Text multiloc field title',
            options: { description: 'Text multiloc field description', trim_on_blur: true, locale: 'fr-FR' }
          },
          {
            type: 'Control',
            scope: "#/properties/#{field_key}/properties/nl-NL",
            label: 'Text multiloc field title',
            options: { description: 'Text multiloc field description', trim_on_blur: true, locale: 'nl-NL' }
          }
        ]
      })
    end
  end

  describe '#visit_multiline_text_multiloc' do
    let(:field) do
      create(
        :custom_field,
        input_type: 'multiline_text_multiloc',
        key: field_key,
        title_multiloc: { 'en' => 'Multiline multiloc field title' },
        description_multiloc: { 'en' => 'Multiline multiloc field description' }
      )
    end

    it 'returns the schema for the given field' do
      expect(generator.visit_multiline_text_multiloc(field)).to eq({
        type: 'VerticalLayout',
        options: { render: 'multiloc' },
        elements: [
          {
            type: 'Control',
            scope: "#/properties/#{field_key}/properties/en",
            label: 'Multiline multiloc field title',
            options: { description: 'Multiline multiloc field description', trim_on_blur: true, textarea: true, locale: 'en' }
          },
          {
            type: 'Control',
            scope: "#/properties/#{field_key}/properties/fr-FR",
            label: 'Multiline multiloc field title',
            options: { description: 'Multiline multiloc field description', trim_on_blur: true, textarea: true, locale: 'fr-FR' }
          },
          {
            type: 'Control',
            scope: "#/properties/#{field_key}/properties/nl-NL",
            label: 'Multiline multiloc field title',
            options: { description: 'Multiline multiloc field description', trim_on_blur: true, textarea: true, locale: 'nl-NL' }
          }
        ]
      })
    end
  end

  describe '#visit_html_multiloc' do
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

  describe '#visit_select' do
    context 'without options' do
      let(:field) do
        create(
          :custom_field_select,
          input_type: 'select',
          key: field_key,
          title_multiloc: { 'en' => 'Select field title' },
          description_multiloc: { 'en' => 'Select field description' }
        )
      end

      it 'returns the schema for the given field' do
        expect(generator.visit_select(field)).to eq({
          type: 'Control',
          scope: "#/properties/#{field_key}",
          label: 'Select field title',
          options: { description: 'Select field description' }
        })
      end
    end

    context 'with options' do
      let(:field) do
        create(
          :custom_field_select,
          :with_options,
          input_type: 'select',
          key: field_key,
          title_multiloc: { 'en' => 'Select field title' },
          description_multiloc: { 'en' => 'Select field description' }
        )
      end

      it 'returns the schema for the given field' do
        expect(generator.visit_select(field)).to eq({
          type: 'Control',
          scope: "#/properties/#{field_key}",
          label: 'Select field title',
          options: { description: 'Select field description' }
        })
      end
    end
  end

  describe '#visit_multiselect' do
    context 'when not required, and without options' do
      let(:field) do
        create(
          :custom_field_select,
          input_type: 'multiselect',
          key: field_key,
          title_multiloc: { 'en' => 'Multiselect field title' },
          description_multiloc: { 'en' => 'Multiselect field description' }
        )
      end

      it 'returns the schema for the given field' do
        expect(generator.visit_multiselect(field)).to eq({
          type: 'Control',
          scope: "#/properties/#{field_key}",
          label: 'Multiselect field title',
          options: { description: 'Multiselect field description' }
        })
      end
    end

    context 'when not required, and with options' do
      let(:field) do
        create(
          :custom_field_select,
          :with_options,
          input_type: 'multiselect',
          key: field_key,
          title_multiloc: { 'en' => 'Multiselect field title' },
          description_multiloc: { 'en' => 'Multiselect field description' }
        )
      end

      it 'returns the schema for the given field' do
        expect(generator.visit_multiselect(field)).to eq({
          type: 'Control',
          scope: "#/properties/#{field_key}",
          label: 'Multiselect field title',
          options: { description: 'Multiselect field description' }
        })
      end
    end

    context 'when required, and with options' do
      let(:field) do
        create(
          :custom_field_select,
          :with_options,
          input_type: 'multiselect',
          key: field_key,
          required: true,
          title_multiloc: { 'en' => 'Multiselect field title' },
          description_multiloc: { 'en' => 'Multiselect field description' }
        )
      end

      it 'returns the schema for the given field' do
        expect(generator.visit_multiselect(field)).to eq({
          type: 'Control',
          scope: "#/properties/#{field_key}",
          label: 'Multiselect field title',
          options: { description: 'Multiselect field description' }
        })
      end
    end
  end

  describe '#visit_checkbox' do
    let(:field) do
      create(
        :custom_field_checkbox,
        key: field_key,
        title_multiloc: { 'en' => 'Checkbox field title' },
        description_multiloc: { 'en' => 'Checkbox field description' }
      )
    end

    it 'returns the schema for the given field' do
      expect(generator.visit_checkbox(field)).to eq({
        type: 'Control',
        scope: "#/properties/#{field_key}",
        label: 'Checkbox field title',
        options: { description: 'Checkbox field description' }
      })
    end
  end

  describe '#visit_date' do
    let(:field) do
      create(
        :custom_field_date,
        key: field_key,
        title_multiloc: { 'en' => 'Date field title' },
        description_multiloc: { 'en' => 'Date field description' }
      )
    end

    it 'returns the schema for the given field' do
      expect(generator.visit_date(field)).to eq({
        type: 'Control',
        scope: "#/properties/#{field_key}",
        label: 'Date field title',
        options: { description: 'Date field description' }
      })
    end
  end

  describe '#visit_files' do
    let(:field) do
      create(
        :custom_field,
        input_type: 'files',
        key: field_key,
        title_multiloc: { 'en' => 'File field title' },
        description_multiloc: { 'en' => 'File field description' }
      )
    end

    it 'returns the schema for the given field' do
      expect(generator.visit_files(field)).to eq({
        type: 'Control',
        scope: "#/properties/#{field_key}",
        label: 'File field title',
        options: { description: 'File field description' }
      })
    end
  end

  describe '#visit_image_files' do
    let(:field) do
      create(
        :custom_field,
        input_type: 'image_files',
        key: field_key,
        title_multiloc: { 'en' => 'Image field title' },
        description_multiloc: { 'en' => 'Image field description' }
      )
    end

    it 'returns the schema for the given field' do
      expect(generator.visit_image_files(field)).to eq({
        type: 'Control',
        scope: "#/properties/#{field_key}",
        label: 'Image field title',
        options: { description: 'Image field description' }
      })
    end
  end

  describe '#visit_point' do
    let(:field) do
      create(
        :custom_field,
        input_type: 'point',
        key: field_key,
        title_multiloc: { 'en' => 'Point field title' },
        description_multiloc: { 'en' => 'Point field description' }
      )
    end

    it 'returns the schema for the given field' do
      expect(generator.visit_point(field)).to be_nil
    end
  end

  describe '#visit_linear_scale' do
    let(:field) do
      create(
        :custom_field_linear_scale,
        key: field_key
      )
    end

    it 'returns the schema for the given field' do
      expect(generator.visit_linear_scale(field)).to eq({
        type: 'Control',
        scope: "#/properties/#{field_key}",
        label: 'We need a swimming pool.',
        options: {
          description: 'Please indicate how strong you agree or disagree.',
          minimum_label: 'Strongly disagree',
          maximum_label: 'Strongly agree'
        }
      })
    end
  end
end
