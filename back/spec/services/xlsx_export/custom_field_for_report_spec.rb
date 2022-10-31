# frozen_string_literal: true

require 'rails_helper'

describe XlsxExport::CustomFieldForReport do
  context 'when no scope is given' do
    subject(:report_field) do
      described_class.new(custom_field)
    end

    let(:name) { 'John' }
    let(:custom_field) do
      create(
        :custom_field,
        key: 'name',
        title_multiloc: {
          'en' => 'Full name',
          'nl-NL' => 'Naam'
        }
      )
    end
    let(:model) { instance_double Idea, custom_field_values: { 'name' => name } }

    describe 'value_from' do
      it 'returns the value for the field' do
        expect(report_field.value_from(model)).to eq name
      end
    end

    describe 'key' do
      it 'returns the field key' do
        expect(report_field.key).to eq custom_field.key
      end
    end

    describe 'input_type' do
      it 'returns the field input_type' do
        expect(report_field.input_type).to eq custom_field.input_type
      end
    end

    describe 'accept' do
      let(:result) { double }
      let(:visitor) { XlsxExport::ValueVisitor.new(model) }

      it 'delegates to the field' do
        expect(custom_field).to receive(:accept).with(visitor).and_return result
        expect(report_field.accept(visitor)).to be result
      end
    end

    describe 'column_header' do
      it 'returns the translated field title' do
        expect(report_field.column_header).to eq 'Full name'
        I18n.with_locale('nl-NL') do
          expect(report_field.column_header).to eq 'Naam'
        end
      end
    end
  end

  context 'when a scope is given' do
    subject(:report_field) do
      described_class.new(custom_field, :author)
    end

    let(:user) { create(:user, custom_field_values: { 'birthyear' => 1984 }) }
    let(:custom_field) do
      create(
        :custom_field,
        resource_type: 'User',
        key: 'birthyear',
        input_type: 'number',
        title_multiloc: { 'en' => 'Year of birth', 'nl-NL' => 'Geboortejaar' }
      )
    end
    let(:model) { instance_double Idea, author: user }

    describe 'value_from' do
      it 'returns the value for the field' do
        expect(report_field.value_from(model)).to eq 1984
      end
    end

    describe 'key' do
      it 'returns the field key' do
        expect(report_field.key).to eq custom_field.key
      end
    end

    describe 'input_type' do
      it 'returns the field input_type' do
        expect(report_field.input_type).to eq custom_field.input_type
      end
    end

    describe 'accept' do
      let(:result) { double }
      let(:visitor) { XlsxExport::ValueVisitor.new(model) }

      it 'delegates to the field' do
        expect(custom_field).to receive(:accept).with(visitor).and_return result
        expect(report_field.accept(visitor)).to be result
      end
    end

    describe 'column_header' do
      it 'returns the translated field title' do
        expect(report_field.column_header).to eq 'Year of birth'
        I18n.with_locale('nl-NL') do
          expect(report_field.column_header).to eq 'Geboortejaar'
        end
      end
    end
  end
end
