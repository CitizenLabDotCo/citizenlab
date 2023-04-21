# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserJsonSchemaGeneratorService do
  subject(:generator) { described_class.new }

  let(:field_key) { 'field_key' }

  describe '#visit_number' do
    context 'when the code is birthyear' do
      let(:field) { create(:custom_field, input_type: 'number', code: 'birthyear', key: field_key) }

      it 'returns the schema for the given built-in field' do
        schema = travel_to(Date.parse('1915-01-01')) { generator.visit_number(field) }
        expect(schema).to eq({
          type: 'number',
          oneOf: [
            { const: 1903 },
            { const: 1902 },
            { const: 1901 },
            { const: 1900 }
          ]
        })
      end
    end

    context 'when the code is something else' do
      let(:field) { create(:custom_field, input_type: 'number', key: field_key) }

      it 'returns the schema for the given field' do
        expect(generator.visit_number(field)).to eq({
          type: 'number'
        })
      end
    end
  end

  describe '#visit_select' do
    context 'when the code is domicile' do
      let(:field) { create(:custom_field, input_type: 'number', code: 'domicile', key: field_key) }
      let!(:area1) { create(:area) }
      let!(:area2) { create(:area) }

      it 'returns the schema for the given built-in field' do
        schema = travel_to(Date.parse('1915-01-01')) { generator.visit_select(field) }
        expect(schema).to eq({
          type: 'string',
          oneOf: [
            { const: area1.id, title: area1.title_multiloc['en'] },
            { const: area2.id, title: area2.title_multiloc['en'] },
            { const: 'outside', title: 'Somewhere else' }
          ]
        })
      end
    end

    context 'when the code is something else' do
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
          })
        end
      end
    end
  end
end
