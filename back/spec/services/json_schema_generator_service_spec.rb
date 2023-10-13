# frozen_string_literal: true

require 'rails_helper'

RSpec.describe JsonSchemaGeneratorService do
  subject(:generator) { described_class.new }

  let(:field_key) { 'field_key' }

  describe '#generate_for' do
    # Create a page to describe that it is not included in the schema.
    let!(:page_field) { create(:custom_field_page) }
    let(:field1) { create(:custom_field) }
    let(:field2) { create(:custom_field_select, :with_options) }

    it 'returns the schema for the given fields' do
      expect(generator.generate_for([page_field, field1, field2])).to eq({
        'en' => {
          type: 'object',
          additionalProperties: false,
          properties: {
            field1.key => { type: 'string' },
            field2.key => {
              type: 'string',
              enum: %w[option1 option2]
            }
          }
        },
        'fr-FR' => {
          type: 'object',
          additionalProperties: false,
          properties: {
            field1.key => { type: 'string' },
            field2.key => {
              type: 'string',
              enum: %w[option1 option2]
            }
          }
        },
        'nl-NL' => {
          type: 'object',
          additionalProperties: false,
          properties: {
            field1.key => { type: 'string' },
            field2.key => {
              type: 'string',
              enum: %w[option1 option2]
            }
          }
        }
      })
    end
  end

  describe '#visit_text' do
    let(:field) { create(:custom_field, input_type: 'text', key: field_key) }

    it 'returns the schema for the given field' do
      expect(generator.visit_text(field)).to eq({
        type: 'string'
      })
    end
  end

  describe '#visit_number' do
    let(:field) { create(:custom_field, input_type: 'number', key: field_key) }

    it 'returns the schema for the given field' do
      expect(generator.visit_number(field)).to eq({
        type: 'number'
      })
    end
  end

  describe '#visit_multiline_text' do
    let(:field) { create(:custom_field, input_type: 'multiline_text', key: field_key) }

    it 'returns the schema for the given field' do
      expect(generator.visit_multiline_text(field)).to eq({
        type: 'string'
      })
    end
  end

  describe '#visit_html' do
    let(:field) { create(:custom_field, input_type: 'html', key: field_key) }

    it 'returns the schema for the given field' do
      expect(generator.visit_html(field)).to eq({
        type: 'string'
      })
    end
  end

  describe '#visit_text_multiloc' do
    let(:field) { create(:custom_field, input_type: 'text_multiloc', key: field_key) }

    it 'returns the schema for the given field' do
      expect(generator.visit_text_multiloc(field)).to eq({
        type: 'object',
        minProperties: 1,
        properties: {
          'en' => { type: 'string' },
          'fr-FR' => { type: 'string' },
          'nl-NL' => { type: 'string' }
        }
      })
    end
  end

  describe '#visit_multiline_text_multiloc' do
    let(:field) { create(:custom_field, input_type: 'multiline_text_multiloc', key: field_key) }

    it 'returns the schema for the given field' do
      expect(generator.visit_multiline_text_multiloc(field)).to eq({
        type: 'object',
        minProperties: 1,
        properties: {
          'en' => { type: 'string' },
          'fr-FR' => { type: 'string' },
          'nl-NL' => { type: 'string' }
        }
      })
    end
  end

  describe '#visit_html_multiloc' do
    let(:field) { create(:custom_field, input_type: 'html_multiloc', key: field_key) }

    it 'returns the schema for the given field' do
      expect(generator.visit_html_multiloc(field)).to eq({
        type: 'object',
        minProperties: 1,
        properties: {
          'en' => { type: 'string' },
          'fr-FR' => { type: 'string' },
          'nl-NL' => { type: 'string' }
        }
      })
    end
  end

  describe '#visit_select' do
    context 'without options' do
      let(:field) { create(:custom_field_select, input_type: 'select', key: field_key) }

      it 'returns the schema for the given field' do
        expect(generator.visit_select(field)).to eq({
          type: 'string'
        })
      end
    end

    context 'with options' do
      let(:field) { create(:custom_field_select, :with_options, input_type: 'select', key: field_key) }

      it 'returns the schema for the given field' do
        expect(generator.visit_select(field)).to eq({
          type: 'string',
          enum: %w[option1 option2]
        })
      end
    end
  end

  describe '#visit_multiselect' do
    context 'when not required, and without options' do
      let(:field) { create(:custom_field_select, input_type: 'multiselect', key: field_key) }

      it 'returns the schema for the given field' do
        expect(generator.visit_multiselect(field)).to eq({
          type: 'array',
          uniqueItems: true,
          maxItems: 0,
          minItems: 0,
          items: {
            type: 'string'
          }
        })
      end
    end

    context 'when not required, and with options' do
      let(:field) { create(:custom_field_select, :with_options, input_type: 'multiselect', key: field_key) }

      it 'returns the schema for the given field' do
        expect(generator.visit_multiselect(field)).to eq({
          type: 'array',
          uniqueItems: true,
          maxItems: 2,
          minItems: 0,
          items: {
            type: 'string',
            oneOf: [
              {
                const: 'option1',
                title: 'youth council'
              },
              {
                const: 'option2',
                title: 'youth council'
              }
            ]
          }
        })
      end
    end

    context 'when required, and with options' do
      let(:field) { create(:custom_field_select, :with_options, input_type: 'multiselect', key: field_key, required: true) }

      it 'returns the schema for the given field' do
        expect(generator.visit_multiselect(field)).to eq({
          type: 'array',
          uniqueItems: true,
          maxItems: 2,
          minItems: 1,
          items: {
            type: 'string',
            oneOf: [
              {
                const: 'option1',
                title: 'youth council'
              },
              {
                const: 'option2',
                title: 'youth council'
              }
            ]
          }
        })
      end
    end
  end

  describe '#visit_checkbox' do
    let(:field) { create(:custom_field_checkbox, key: field_key) }

    it 'returns the schema for the given field' do
      expect(generator.visit_checkbox(field)).to eq({
        type: 'boolean'
      })
    end
  end

  describe '#visit_date' do
    let(:field) { create(:custom_field_date, key: field_key) }

    it 'returns the schema for the given field' do
      expect(generator.visit_date(field)).to eq({
        type: 'string',
        format: 'date'
      })
    end
  end

  describe '#visit_files' do
    let(:field) { create(:custom_field, input_type: 'files', key: field_key) }

    it 'returns the schema for the given field' do
      expect(generator.visit_files(field)).to eq({
        type: 'array',
        items: {
          type: 'object',
          properties: {
            file_by_content: {
              type: 'object',
              properties: {
                file: {
                  type: 'string'
                },
                name: {
                  type: 'string'
                }
              }
            },
            name: {
              type: 'string'
            }
          }
        }
      })
    end
  end

  describe '#visit_image_files' do
    let(:field) { create(:custom_field, input_type: 'image_files', key: field_key) }

    it 'returns the schema for the given field' do
      expect(generator.visit_image_files(field)).to eq({
        type: 'array',
        items: {
          type: 'object',
          properties: {
            image: {
              type: 'string'
            }
          }
        }
      })
    end
  end

  describe '#visit_point' do
    let(:field) { create(:custom_field, input_type: 'point', key: field_key) }

    it 'returns the schema for the given field' do
      expect(generator.visit_point(field)).to eq({
        required: %w[type coordinates],
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['Point']
          },
          coordinates: {
            type: 'array',
            minItems: 2,
            items: {
              type: 'number'
            }
          }
        }
      })
    end
  end

  describe '#visit_linear_scale' do
    let(:field) { create(:custom_field_linear_scale, key: field_key) }

    it 'returns the schema for the given field' do
      expect(generator.visit_linear_scale(field)).to eq({
        type: 'number',
        minimum: 1,
        maximum: field.maximum
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
    let(:field) { create(:custom_field, input_type: 'file_upload', key: field_key) }

    it 'returns the schema for the given field' do
      expect(generator.visit_file_upload(field)).to eq({
        type: 'object',
        properties: {
          content: {
            type: 'string'
          },
          name: {
            type: 'string'
          }
        }
      })
    end
  end
end
