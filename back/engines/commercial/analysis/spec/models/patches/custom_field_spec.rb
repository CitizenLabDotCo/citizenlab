# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomField do
  describe 'Deleting a custom_field' do
    it 'deletes it from the analysis' do
      analysis = create(:analysis, :with_custom_field)
      custom_fields = analysis.custom_fields
      expect { custom_fields.first.destroy }.to change { analysis.custom_fields.count }.from(1).to(0)
    end
  end
end
