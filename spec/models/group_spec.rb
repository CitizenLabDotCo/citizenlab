require 'rails_helper'

RSpec.describe Group, type: :model do
  describe "Default factory" do
    it "is valid" do
      expect(build(:group)).to be_valid
    end
  end

  context "users (members)" do
    it "can be assigned to groups" do
      g1 = create(:group)
      expect(g1.users).to be_empty
      g2 = create(:group)
      u1_g1 = create(:user) # member group one
      g1.users << u1_g1
      expect(u1_g1.groups).to include(g1)
      expect(u1_g1.groups).not_to include(g2)
      u2_g2 = create(:user) # member group two
      g2.users << u2_g2
      expect(u2_g2.groups).to include(g2)
      expect(u2_g2.groups).not_to include(g1)
      u3_g1_g2 = create(:user) # member group one and two
      g1.users << u3_g1_g2
      g2.users << u3_g1_g2
      expect(u3_g1_g2.groups).to include(g1)
      expect(u3_g1_g2.groups).to include(g2)
      u4 = create(:user) # member of no group
      expect(u4.groups).to be_empty
    end

    it "can be added to and removed from groups" do
      g = create(:group)
      expect(g.users).to be_empty
      u1 = create(:user)
      u2 = create(:user)
      g.add_member u1
      g.add_member u2
      expect(u1.groups).to include(g)
      expect(u2.groups).to include(g)
      g.remove_member u1
      expect(u1.groups).not_to include(g)
      expect(u2.groups).to include(g)
      g.remove_member u2
      expect(u2.groups).not_to include(g)
      expect(g.users).to be_empty
    end
  end
end
