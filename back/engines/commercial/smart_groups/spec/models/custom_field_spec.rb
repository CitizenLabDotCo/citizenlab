require 'rails_helper'

RSpec.describe CustomField, type: :model do
  describe 'destroy' do
    let(:cf) { create(:custom_field) }

    it 'is allowed when there are no references in smart_group rules' do
      expect(cf.destroy).to be_truthy
    end

    it 'is not allowed when there are references in smart_group_rules' do
      group = create(:smart_group, rules: [
                       { ruleType: 'custom_field_text', customFieldId: cf.id, predicate: 'is_empty' }
                     ])
      expect(cf.destroy).to be false
      expect(cf.errors[:base].size).to eq 1
    end
  end
end
