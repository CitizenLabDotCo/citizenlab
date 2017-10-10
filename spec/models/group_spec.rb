require 'rails_helper'

RSpec.describe Group, type: :model do
  context "users (members)" do
    it "can be assigned to groups" do
      g = create(:group)
    end

    it "can be added to and removed from groups" do
      g = create(:group)
    end
  end
end
