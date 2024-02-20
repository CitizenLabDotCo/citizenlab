# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomField do
  describe 'Deleting a custom_field' do
    it 'deletes it from the analysis' do
      field = create(:custom_field)
      analysis = create(:analysis, additional_custom_fields: [field])
      expect { field.destroy }.to change { analysis.additional_custom_fields.count }.from(1).to(0)
    end
  end
end
