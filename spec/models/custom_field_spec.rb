require 'rails_helper'

RSpec.describe CustomField, type: :model do

  context "hooks" do

    it "should generate a key on creation, if not specified" do
      cf = create(:custom_field, key: nil)
      expect(cf.key).to be_present
    end

    it "should generate unique keys in the resource_type scope, if not specified" do
      cf1 = create(:custom_field)
      cf2 = create(:custom_field)
      cf3 = create(:custom_field)
      expect([cf1, cf2, cf3].map(&:key).uniq).to match [cf1, cf2, cf3].map(&:key)
    end

  end

  describe "destroy" do

    let(:cf) { create(:custom_field) }

    it "is allowed when there are no references in smart_group rules" do
      expect(cf.destroy).to be_truthy
    end

    it "is not allowed when there are references in smart_group_rules" do
      group = create(:smart_group, rules: [
        {ruleType: 'custom_field_text', customFieldId: cf.id, predicate: 'is_empty'}
      ])
      expect(cf.destroy).to be false
      expect(cf.errors[:base].size).to eq 1
    end

  end
end
