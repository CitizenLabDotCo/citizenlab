# frozen_string_literal: true

require 'rails_helper'

class UiSchemaGeneratorServiceSubclass < UiSchemaGeneratorService
  def generate_for_current_locale(fields)
    {
      elements: fields.filter_map { |field| visit field }
    }
  end
end

RSpec.describe UiSchemaGeneratorService do
  subject(:generator) { described_class.new }

  let(:field_key) { 'field_key' }

  describe '#generate_for' do
    # Create a page to describe that it is not included in the schema.
    let!(:page_field) { create(:custom_field_page) }
    let(:field1) do
      create(
        :custom_field,
        input_type: 'text',
        title_multiloc: { 'en' => 'Field1 title', 'fr-BE' => 'Field1 titre', 'nl-BE' => 'Field1 titel' },
        description_multiloc: { 'en' => 'Field1 description' }
      )
    end
    let(:field2) do
      create(
        :custom_field_select,
        :with_options,
        input_type: 'select',
        title_multiloc: { 'en' => 'Field2 title', 'fr-BE' => 'Field2 titre', 'nl-BE' => 'Field2 titel' },
        description_multiloc: { 'en' => 'Field2 description' }
      )
    end

    it 'returns the schema for the given fields' do
      expect(UiSchemaGeneratorServiceSubclass.new.generate_for([page_field, field1, field2])).to eq({
        'en' => {
          elements: [
            {
              type: 'Control',
              scope: "#/properties/#{field1.key}",
              label: 'Field1 title',
              options: { input_type: field1.input_type, description: 'Field1 description', transform: 'trim_on_blur' }
            },
            {
              type: 'Control',
              scope: "#/properties/#{field2.key}",
              label: 'Field2 title',
              options: { input_type: field2.input_type, description: 'Field2 description' }
            }
          ]
        },
        'fr-BE' => {
          elements: [
            {
              type: 'Control',
              scope: "#/properties/#{field1.key}",
              label: 'Field1 titre',
              options: { input_type: field1.input_type, description: 'Field1 description', transform: 'trim_on_blur' }
            },
            {
              type: 'Control',
              scope: "#/properties/#{field2.key}",
              label: 'Field2 titre',
              options: { input_type: field2.input_type, description: 'Field2 description' }
            }
          ]
        },
        'nl-BE' => {
          elements: [
            {
              type: 'Control',
              scope: "#/properties/#{field1.key}",
              label: 'Field1 titel',
              options: { input_type: field1.input_type, description: 'Field1 description', transform: 'trim_on_blur' }
            },
            {
              type: 'Control',
              scope: "#/properties/#{field2.key}",
              label: 'Field2 titel',
              options: { input_type: field2.input_type, description: 'Field2 description' }
            }
          ]
        }
      })
    end

    it 'swaps data images' do
      allow_any_instance_of(TextImageService).to(
        receive(:render_data_images)
          .with(field1, :description_multiloc)
          .and_return({ 'en' => 'Description with swapped images' })
      )

      expect(UiSchemaGeneratorServiceSubclass.new.generate_for([field1])).to match(hash_including(
        'en' => {
          elements: [
            {
              type: 'Control',
              scope: "#/properties/#{field1.key}",
              label: 'Field1 title',
              options: { input_type: field1.input_type, description: 'Description with swapped images', transform: 'trim_on_blur' }
            }
          ]
        }
      ))
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
        options: { input_type: field.input_type, description: 'Text field description', transform: 'trim_on_blur' }
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
        options: { input_type: field.input_type, description: 'Number field description' }
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
        options: { input_type: field.input_type, description: 'Multiline field description', textarea: true, transform: 'trim_on_blur' }
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
        options: { input_type: field.input_type, description: 'HTML field description', render: 'WYSIWYG' }
      })
    end
  end

  describe '#visit_text_multiloc' do
    let(:field) do
      create(
        :custom_field,
        input_type: 'text_multiloc',
        key: field_key,
        title_multiloc: { 'en' => 'Text multiloc field title', 'fr-BE' => 'Titre du champ de texte multiloc' },
        description_multiloc: { 'en' => 'Text multiloc field description' }
      )
    end

    it 'returns the schema for the given field' do
      expect(generator.visit_text_multiloc(field)).to eq({
        type: 'VerticalLayout',
        options: { input_type: field.input_type, render: 'multiloc' },
        elements: [
          {
            type: 'Control',
            scope: "#/properties/#{field_key}/properties/en",
            label: 'Text multiloc field title',
            options: { description: 'Text multiloc field description', trim_on_blur: true, locale: 'en' }
          },
          {
            type: 'Control',
            scope: "#/properties/#{field_key}/properties/fr-BE",
            label: 'Text multiloc field title',
            options: { description: 'Text multiloc field description', trim_on_blur: true, locale: 'fr-BE' }
          },
          {
            type: 'Control',
            scope: "#/properties/#{field_key}/properties/nl-BE",
            label: 'Text multiloc field title',
            options: { description: 'Text multiloc field description', trim_on_blur: true, locale: 'nl-BE' }
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
        options: { input_type: field.input_type, render: 'multiloc' },
        elements: [
          {
            type: 'Control',
            scope: "#/properties/#{field_key}/properties/en",
            label: 'Multiline multiloc field title',
            options: { description: 'Multiline multiloc field description', trim_on_blur: true, textarea: true, locale: 'en' }
          },
          {
            type: 'Control',
            scope: "#/properties/#{field_key}/properties/fr-BE",
            label: 'Multiline multiloc field title',
            options: { description: 'Multiline multiloc field description', trim_on_blur: true, textarea: true, locale: 'fr-BE' }
          },
          {
            type: 'Control',
            scope: "#/properties/#{field_key}/properties/nl-BE",
            label: 'Multiline multiloc field title',
            options: { description: 'Multiline multiloc field description', trim_on_blur: true, textarea: true, locale: 'nl-BE' }
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
        options: { input_type: field.input_type, render: 'multiloc' },
        elements: [
          {
            type: 'Control',
            scope: "#/properties/#{field_key}/properties/en",
            label: 'HTML multiloc field title',
            options: { description: 'HTML multiloc field description', render: 'WYSIWYG', trim_on_blur: true, locale: 'en' }
          },
          {
            type: 'Control',
            scope: "#/properties/#{field_key}/properties/fr-BE",
            label: 'HTML multiloc field title',
            options: { description: 'HTML multiloc field description', render: 'WYSIWYG', trim_on_blur: true, locale: 'fr-BE' }
          },
          {
            type: 'Control',
            scope: "#/properties/#{field_key}/properties/nl-BE",
            label: 'HTML multiloc field title',
            options: { description: 'HTML multiloc field description', render: 'WYSIWYG', trim_on_blur: true, locale: 'nl-BE' }
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
          options: { input_type: field.input_type, description: 'Select field description' }
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
          options: { input_type: field.input_type, description: 'Select field description' }
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
          options: { input_type: field.input_type, description: 'Multiselect field description' }
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
          options: { input_type: field.input_type, description: 'Multiselect field description' }
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
          options: { input_type: field.input_type, description: 'Multiselect field description' }
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
        options: { input_type: field.input_type, description: 'Checkbox field description' }
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
        options: { input_type: field.input_type, description: 'Date field description' }
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
        options: { input_type: field.input_type, description: 'File field description' }
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
        options: { input_type: field.input_type, description: 'Image field description' }
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
          input_type: field.input_type,
          description: 'Please indicate how strong you agree or disagree.',
          minimum_label: 'Strongly disagree',
          maximum_label: 'Strongly agree'
        }
      })
    end
  end

  describe '#visit_page' do
    let(:field) { create(:custom_field_page) }

    it 'returns the schema for the given field' do
      expect(generator.visit_page(field)).to be_nil
    end
  end

  describe '#visit_file_upload' do
    let(:field) do
      create(
        :custom_field,
        input_type: 'file_upload',
        key: field_key,
        title_multiloc: { 'en' => 'File upload field title' },
        description_multiloc: { 'en' => 'File upload field description' }
      )
    end

    it 'returns the schema for the given field' do
      expect(generator.visit_file_upload(field)).to eq({
        type: 'Control',
        scope: "#/properties/#{field_key}",
        label: 'File upload field title',
        options: { input_type: field.input_type, description: 'File upload field description' }
      })
    end
  end
end
