# frozen_string_literal: true

require 'rails_helper'

describe XlsxExport::DomicileFieldForReport do
  subject(:report_field) do
    described_class.new(custom_field)
  end

  let(:custom_field) do
    create(
      :custom_field,
      code: 'domicile',
      key: 'domicile',
      input_type: 'select',
      title_multiloc: {
        'en' => 'Residence',
        'nl-BE' => 'Verblijfplaats'
      }
    )
  end

  describe '#value_from' do
    context 'when there are no areas' do
      let(:model) { create(:user) }

      it 'returns the empty string' do
        expect(report_field.value_from(model)).to eq ''
      end
    end

    context 'when the field value is "outside"' do
      let(:model) { create(:user, custom_field_values: { 'domicile' => 'outside' }) }

      it 'returns empty string' do
        expect(report_field.value_from(model)).to eq ''
      end
    end

    context 'when there are areas' do
      let(:area) do
        create(
          :area,
          title_multiloc: { 'en' => 'Paris', 'nl-BE' => 'Parijs' }
        )
      end
      let(:model) { create(:user, custom_field_values: { 'domicile' => area.id }) }

      it 'returns the area for the field' do
        I18n.with_locale('nl-BE') do
          expect(report_field.value_from(model)).to eq 'Parijs'
        end
      end
    end
  end
end
