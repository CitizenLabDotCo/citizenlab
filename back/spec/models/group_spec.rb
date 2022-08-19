# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Group, type: :model do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:group)).to be_valid
    end
  end

  context 'users (members)' do
    it 'can be assigned to manual groups' do
      g1 = create(:group)
      expect(g1.members).to be_empty
      g2 = create(:group)
      u1_g1 = create(:user) # member group one
      g1.members << u1_g1
      expect(u1_g1.groups).to include(g1)
      expect(u1_g1.groups).not_to include(g2)
      u2_g2 = create(:user) # member group two
      g2.members << u2_g2
      expect(u2_g2.groups).to include(g2)
      expect(u2_g2.groups).not_to include(g1)
      u3_g1_g2 = create(:user) # member group one and two
      g1.members << u3_g1_g2
      g2.members << u3_g1_g2
      expect(u3_g1_g2.groups).to include(g1)
      expect(u3_g1_g2.groups).to include(g2)
      u4 = create(:user) # member of no group
      expect(u4.groups).to be_empty
    end

    it 'can be added to and removed from manual groups' do
      g = create(:group)
      expect(g.members).to be_empty
      u1 = create(:user)
      u2 = create(:user)

      g.add_member u1
      g.add_member u2
      g.reload
      expect(u1.groups).to include(g)
      expect(u2.groups).to include(g)

      g.remove_member u1
      g.reload
      expect(u1.reload.groups).not_to include(g)
      expect(u2.reload.groups).to include(g)

      g.remove_member u2
      g.reload
      expect(u2.reload.groups).not_to include(g)
      expect(g.members).to be_empty
    end

    it 'has consistent responses between member and member_ids' do
      g1 = create(:group)
      g1.members << create_list(:user, 5)
      expect(g1.member_ids).to match g1.members.map(&:id)
    end
  end

  describe 'update_memberships_count!' do
    it 'does nothing for a manual group' do
      group = build(:group)
      create_list(:membership, 2, group: group)
      expect(group).not_to receive(:update).with({ memberships_count: 2 })
      group.update_memberships_count!
    end
  end
end
