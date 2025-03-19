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
              options: {
                input_type: field2.input_type,
                description: 'Field2 description',
                enumNames: ['youth council', 'youth council']
              }
            }
          ]
        },
        'fr-FR' => {
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
              options: {
                input_type: field2.input_type,
                description: 'Field2 description',
                enumNames: ['conseil des jeunes', 'conseil des jeunes']
              }
            }
          ]
        },
        'nl-NL' => {
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
              options: {
                input_type: field2.input_type,
                description: 'Field2 description',
                enumNames: %w[jeugdraad jeugdraad]
              }
            }
          ]
        }
      })
    end

    it 'swaps data images' do
      allow_any_instance_of(TextImageService).to(
        receive(:render_data_images_multiloc)
          .with(field1.description_multiloc, field: :description_multiloc, imageable: field1)
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
        title_multiloc: { 'en' => 'Text multiloc field title', 'fr-FR' => 'Titre du champ de texte multiloc' },
        description_multiloc: { 'en' => 'Text multiloc field description' }
      )
    end

    it 'returns the schema for the given field' do
      expect(generator.visit_text_multiloc(field)).to eq({
        type: 'Control',
        scope: "#/properties/#{field_key}/properties/en",
        label: 'Text multiloc field title',
        options: {
          description: 'Text multiloc field description',
          trim_on_blur: true,
          input_type: 'text_multiloc',
          render: 'multiloc'
        }
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
        type: 'Control',
        scope: "#/properties/#{field_key}/properties/en",
        label: 'Multiline multiloc field title',
        options: {
          description: 'Multiline multiloc field description',
          trim_on_blur: true, textarea: true,
          input_type: 'multiline_text_multiloc',
          render: 'multiloc'
        }
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
        type: 'Control',
        scope: "#/properties/#{field_key}/properties/en",
        label: 'HTML multiloc field title',
        options: {
          description: 'HTML multiloc field description',
          render: 'multiloc',
          trim_on_blur: true,
          input_type: 'html_multiloc'
        }
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
          options: {
            input_type: field.input_type,
            description: 'Select field description',
            enumNames: []
          }
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
          options: {
            input_type: field.input_type,
            description: 'Select field description',
            enumNames: ['youth council', 'youth council']
          }
        })
      end

      it 'returns the options in a random order for the given field' do
        create(:custom_field_option, custom_field: field, key: 'option3', title_multiloc: { en: 'Option 3' })
        create(:custom_field_option, custom_field: field, key: 'option4', title_multiloc: { en: 'Option 4' })
        create(:custom_field_option, custom_field: field, key: 'other', other: true, title_multiloc: { en: 'Other' })
        field.update!(random_option_ordering: true)

        # NOTE: Checking 10 loops to make sure the chance of a flaky test here is very very low
        attempts = []
        10.times do
          options = generator.visit_select(CustomField.find(field.id)).dig(:options, :enumNames)
          expect(options.last).to eq 'Other'
          attempts << options
        end
        expect(attempts.uniq.size).to be > 1
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

  describe '#visit_ranking' do
    let(:field) do
      create(
        :custom_field_ranking,
        :with_options,
        key: field_key,
        title_multiloc: { 'en' => 'Ranking field title' },
        description_multiloc: { 'en' => 'Ranking field description' }
      )
    end

    it 'returns the schema for the given field' do
      expect(generator.visit_ranking(field)).to eq({
        type: 'Control',
        scope: "#/properties/#{field_key}",
        label: 'Ranking field title',
        options: { input_type: field.input_type, description: 'Ranking field description' }
      })
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
        :custom_field_point,
        key: field_key,
        title_multiloc: { 'en' => 'Point field title' },
        description_multiloc: { 'en' => 'Point field description' }
      )
    end
    let!(:map_config) { create(:map_config, mappable: field) }

    it 'returns the schema for the given field' do
      expect(generator.visit_point(field)).to eq({
        type: 'Control',
        scope: "#/properties/#{field_key}",
        label: 'Point field title',
        options: { input_type: field.input_type, description: 'Point field description', map_config_id: map_config.id }
      })
    end
  end

  describe '#visit_line' do
    let(:field) do
      create(
        :custom_field_line,
        key: field_key,
        title_multiloc: { 'en' => 'Line field title' },
        description_multiloc: { 'en' => 'Line field description' }
      )
    end
    let!(:map_config) { create(:map_config, mappable: field) }

    it 'returns the schema for the given field' do
      expect(generator.visit_line(field)).to eq({
        type: 'Control',
        scope: "#/properties/#{field_key}",
        label: 'Line field title',
        options: { input_type: field.input_type, description: 'Line field description', map_config_id: map_config.id }
      })
    end
  end

  describe '#visit_polygon' do
    let(:field) do
      create(
        :custom_field_line,
        key: field_key,
        title_multiloc: { 'en' => 'Polygon field title' },
        description_multiloc: { 'en' => 'Polygon field description' }
      )
    end
    let!(:map_config) { create(:map_config, mappable: field) }

    it 'returns the schema for the given field' do
      expect(generator.visit_polygon(field)).to eq({
        type: 'Control',
        scope: "#/properties/#{field_key}",
        label: 'Polygon field title',
        options: { input_type: field.input_type, description: 'Polygon field description', map_config_id: map_config.id }
      })
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
          linear_scale_label1: 'Strongly disagree',
          linear_scale_label2: 'Disagree',
          linear_scale_label3: 'Neutral',
          linear_scale_label4: 'Agree',
          linear_scale_label5: 'Strongly agree',
          linear_scale_label6: '',
          linear_scale_label7: '',
          linear_scale_label8: '',
          linear_scale_label9: '',
          linear_scale_label10: '',
          linear_scale_label11: ''
        }
      })
    end
  end

  describe '#visit_sentiment_linear_scale' do
    let(:field) do
      create(
        :custom_field_sentiment_linear_scale,
        key: field_key
      )
    end

    it 'returns the schema for the given field' do
      expect(generator.visit_sentiment_linear_scale(field)).to eq({
        type: 'Control',
        scope: "#/properties/#{field_key}",
        label: 'We need a swimming pool.',
        options: {
          input_type: field.input_type,
          description: 'Please indicate how strong you agree or disagree.',
          ask_follow_up: false,
          linear_scale_label1: 'Strongly disagree',
          linear_scale_label2: 'Disagree',
          linear_scale_label3: 'Neutral',
          linear_scale_label4: 'Agree',
          linear_scale_label5: 'Strongly agree'
        }
      })
    end
  end

  describe '#visit_rating' do
    let(:field) do
      create(
        :custom_field_rating,
        key: field_key
      )
    end

    it 'returns the schema for the given field' do
      expect(generator.visit_rating(field)).to eq({
        type: 'Control',
        scope: "#/properties/#{field_key}",
        label: 'How would you rate our service?',
        options: {
          input_type: field.input_type,
          description: 'Please rate your experience from 1 (poor) to 5 (excellent).'
        }
      })
    end
  end

  describe '#visit_matrix_linear_scale' do
    let(:field) { create(:custom_field_matrix_linear_scale, key: field_key) }

    it 'returns the schema for the given field' do
      expect(generator.visit_matrix_linear_scale(field)).to eq({
        type: 'Control',
        scope: "#/properties/#{field_key}",
        label: 'Please indicate how strong you agree or disagree with the following statements.',
        options: {
          description: 'Which councils are you attending in our city?',
          input_type: 'matrix_linear_scale',
          statements: [
            { key: 'send_more_animals_to_space', label: 'We should send more animals into space' },
            { key: 'ride_bicycles_more_often', label: 'We should ride our bicycles more often' }
          ],
          linear_scale_label1: 'Strongly disagree',
          linear_scale_label2: '',
          linear_scale_label3: '',
          linear_scale_label4: '',
          linear_scale_label5: 'Strongly agree',
          linear_scale_label6: '',
          linear_scale_label7: '',
          linear_scale_label8: '',
          linear_scale_label9: '',
          linear_scale_label10: '',
          linear_scale_label11: ''
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

  describe '#visit_shapefile_upload' do
    let(:field) do
      create(
        :custom_field,
        input_type: 'shapefile_upload',
        key: field_key,
        title_multiloc: { 'en' => 'Shapefile upload field title' },
        description_multiloc: { 'en' => 'Shapefile upload field description' }
      )
    end

    it 'returns the schema for the given field' do
      expect(generator.visit_shapefile_upload(field)).to eq({
        type: 'Control',
        scope: "#/properties/#{field_key}",
        label: 'Shapefile upload field title',
        options: { input_type: field.input_type, description: 'Shapefile upload field description' }
      })
    end
  end
end
