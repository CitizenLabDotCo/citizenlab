# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomFieldOption do
  describe 'destroy' do
    let_it_be(:cf, reload: true) { create(:custom_field_select) }
    let_it_be(:cfo, reload: true) { create(:custom_field_option, custom_field: cf) }

    it 'is allowed when there are no references in smart_group rules' do
      expect(cfo.destroy).to be cfo
    end

    it 'is not allowed when there are references in smart_group_rules' do
      create(
        :smart_group,
        rules: [
          { ruleType: 'custom_field_select', customFieldId: cf.id, predicate: 'has_value', value: cfo.id }
        ]
      )
      expect(cfo.destroy).to be false
      expect(cfo.errors[:base].size).to eq 1
    end
  end
end
