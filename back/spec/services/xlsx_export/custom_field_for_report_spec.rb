# frozen_string_literal: true

require 'rails_helper'

describe XlsxExport::CustomFieldForReport do
  context 'when no scope is given' do
    subject(:report_field) do
      described_class.new(custom_field)
    end

    let(:input_type) { 'text' }
    let(:custom_field) do
      create(
        :custom_field,
        input_type: input_type,
        key: 'name',
        title_multiloc: {
          'en' => 'Full name',
          'nl-BE' => 'Naam'
        }
      )
    end
    let(:name) { 'John' }
    let(:model) { instance_double Idea, custom_field_values: { 'name' => name } }

    describe '#value_from' do
      context 'for a simple field' do
        it 'returns the value for the field' do
          expect(report_field.value_from(model)).to eq name
        end
      end

      context 'for a select field without options' do
        let(:input_type) { 'select' }
        let(:field_value) { 'cat' }
        let(:model) { instance_double Idea, custom_field_values: { 'name' => field_value } }

        it 'returns the empty string' do
          expect(report_field.value_from(model)).to eq ''
        end
      end

      context 'for a select field with options' do
        let(:input_type) { 'select' }
        let(:field_value) { 'cat' }
        let(:model) { instance_double Idea, custom_field_values: { 'name' => field_value } }
        let!(:field_option1) do
          create(
            :custom_field_option,
            custom_field: custom_field,
            key: 'cat',
            title_multiloc: { 'en' => 'Cat', 'nl-BE' => 'Kat' }
          )
        end
        let!(:field_option2) do
          create(
            :custom_field_option,
            custom_field: custom_field,
            key: 'dog',
            title_multiloc: { 'en' => 'Dog', 'nl-BE' => 'Hond' }
          )
        end

        it 'returns the value for the field' do
          I18n.with_locale('nl-BE') do
            expect(report_field.value_from(model)).to eq 'Kat'
            model.custom_field_values['name'] = 'dog'
            expect(report_field.value_from(model)).to eq 'Hond'
          end
        end

        it 'returns the empty string when the field has an unknown value' do
          model.custom_field_values['name'] = 'unknown'
          expect(report_field.value_from(model)).to eq ''
        end
      end
    end

    describe '#key' do
      it 'returns the field key' do
        expect(report_field.key).to eq custom_field.key
      end
    end

    describe '#input_type' do
      it 'returns the field input_type' do
        expect(report_field.input_type).to eq custom_field.input_type
      end
    end

    describe '#accept' do
      let(:result) { double }
      let(:visitor) { XlsxExport::ValueVisitor.new(model, {}) }

      it 'delegates to the field' do
        expect(custom_field).to receive(:accept).with(visitor).and_return result
        expect(report_field.accept(visitor)).to be result
      end
    end

    describe '#column_header' do
      it 'returns the translated field title' do
        expect(report_field.column_header).to eq 'Full name'
        I18n.with_locale('nl-BE') do
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
    let(:input_type) { 'number' }
    let(:custom_field) do
      create(
        :custom_field,
        resource_type: 'User',
        key: 'birthyear',
        input_type: input_type,
        title_multiloc: { 'en' => 'Year of birth', 'nl-BE' => 'Geboortejaar' }
      )
    end
    let(:model) { instance_double Idea, author: user }

    describe '#value_from' do
      context 'for a simple field' do
        it 'returns the value for the field' do
          expect(report_field.value_from(model)).to eq 1984
        end
      end

      context 'for a select field without options' do
        let(:input_type) { 'select' }
        let(:user) { create(:user, custom_field_values: { 'birthyear' => '1991' }) }

        it 'returns the empty string' do
          expect(report_field.value_from(model)).to eq ''
        end
      end

      context 'for a select field with options' do
        let(:input_type) { 'select' }
        let(:field_value) { '1990' }
        let(:user) { create(:user, custom_field_values: { 'birthyear' => '1990' }) }
        let!(:field_option1) do
          create(
            :custom_field_option,
            custom_field: custom_field,
            key: '1990',
            title_multiloc: { 'en' => '1990-EN', 'nl-BE' => '1990-NL' }
          )
        end
        let!(:field_option2) do
          create(
            :custom_field_option,
            custom_field: custom_field,
            key: '1991',
            title_multiloc: { 'en' => '1991-EN', 'nl-BE' => '1991-NL' }
          )
        end

        it 'returns the value for the field' do
          I18n.with_locale('nl-BE') do
            expect(report_field.value_from(model)).to eq '1990-NL'
            user.custom_field_values['birthyear'] = '1991'
            expect(report_field.value_from(model)).to eq '1991-NL'
          end
        end

        it 'returns the empty string when the field has an unknown value' do
          user.custom_field_values['birthyear'] = 'unknown'
          expect(report_field.value_from(model)).to eq ''
        end
      end
    end

    describe '#key' do
      it 'returns the field key' do
        expect(report_field.key).to eq custom_field.key
      end
    end

    describe '#input_type' do
      it 'returns the field input_type' do
        expect(report_field.input_type).to eq custom_field.input_type
      end
    end

    describe '#accept' do
      let(:result) { double }
      let(:visitor) { XlsxExport::ValueVisitor.new(model, {}) }

      it 'delegates to the field' do
        expect(custom_field).to receive(:accept).with(visitor).and_return result
        expect(report_field.accept(visitor)).to be result
      end
    end

    describe '#column_header' do
      it 'returns the translated field title' do
        expect(report_field.column_header).to eq 'Year of birth'
        I18n.with_locale('nl-BE') do
          expect(report_field.column_header).to eq 'Geboortejaar'
        end
      end
    end
  end
end
