# frozen_string_literal: true

require 'rails_helper'

describe CopiesUpdatingService do
  subject(:service) { described_class.new }

  describe '#update_custom_fields' do
    it 'updates default custom fields' do
      field = create(:custom_field_domicile, title_multiloc: {
        'en' => 'domicile',
        'en-CA' => 'Canadian domicile',
        'en-GB' => 'domicile',
        'es-ES' => 'domicile',
        'es-CL' => 'Hola'
      })

      expect(Rails.logger).to receive(:info)
      service.update_custom_fields

      expect(field.reload.title_multiloc).to include({
        'en' => 'domicile',
        'en-CA' => 'Canadian domicile',
        'en-GB' => 'domicile',
        'es-ES' => 'Lugar de residencia',
        'es-CL' => 'Hola',
        'pl-PL' => 'Miejsce zamieszkania'
      })
    end

    it 'does not update non-default custom fields' do
      field = create(:custom_field, title_multiloc: { 'en' => 'field' })

      expect(Rails.logger).not_to receive(:info)
      service.update_custom_fields

      expect(field.reload.title_multiloc).to eq({ 'en' => 'field' })
    end
  end
end
