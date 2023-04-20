# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomField do
  describe 'destroy' do
    let(:cf) { create(:custom_field) }

    it 'is allowed when there are no references in smart_group rules' do
      expect(cf.destroy).to be cf
    end

    it 'is not allowed when there are references in smart_group_rules' do
      create(
        :smart_group,
        rules: [
          { ruleType: 'custom_field_text', customFieldId: cf.id, predicate: 'is_empty' }
        ]
      )
      expect(cf.destroy).to be false
      expect(cf.errors[:base].size).to eq 1
    end
  end
end
