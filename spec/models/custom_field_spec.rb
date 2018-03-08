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
end
