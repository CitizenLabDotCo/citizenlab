require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'groups and group_ids' do
    let!(:manual_group) { create(:group) }
    let!(:rules_group) do
      create(:smart_group, rules: [
               { ruleType: 'email', predicate: 'is', value: 'user@test.com' }
             ])
    end

    it 'returns rule groups' do
      user = create(:user, email: 'user@test.com')
      expect(user.groups).to match_array [rules_group]
      expect(user.group_ids).to match_array [rules_group.id]
    end

    it 'returns manual groups and rule groups' do
      user = create(:user, manual_groups: [manual_group], email: 'user@test.com')
      expect(user.groups).to match_array [manual_group, rules_group]
      expect(user.group_ids).to match_array [manual_group.id, rules_group.id]
    end
  end

  describe 'in_group' do
    it 'gets all users in a rules group' do
      group = create(:smart_group)
      user1 = create(:user, email: 'jos@test.com')
      user2 = create(:user, email: 'jules@test.com')
      user3 = create(:user)
      user4 = create(:user, manual_groups: [create(:group)])

      expect(User.in_group(group).pluck(:id)).to match_array [user1.id, user2.id]
    end
  end

  describe 'in_any_group' do
    it 'gets the union of all users in the given groups' do
      group1 = create(:smart_group)
      group2 = create(:group)
      user1 = create(:user, email: 'jos@test.com', manual_groups: [group2])
      user2 = create(:user, email: 'jules@test.com')
      user3 = create(:user)
      user4 = create(:user, manual_groups: [group2])

      expect(User.in_any_group([group1, group2])).to match_array [user1, user2, user4]
    end
  end

  describe 'in_any_groups?' do
    it 'returns truety iff the user is a member of one of the given groups' do
      group1 = create(:smart_group)
      group2 = create(:group)
      user1 = create(:user, email: 'jos@test.com', manual_groups: [group2])
      user2 = create(:user, email: 'jules@test.com')
      user3 = create(:user, email: 'jules@something.com')

      expect(user1.in_any_groups?(Group.where(id: group1))).to be_truthy
      expect(user1.in_any_groups?(Group.where(id: group2))).to be_truthy
      expect(user1.in_any_groups?(Group.where(id: [group1, group2]))).to be_truthy
      expect(user1.in_any_groups?(Group.none)).to be_falsey
      expect(user2.in_any_groups?(Group.where(id: [group1]))).to be_truthy
      expect(user2.in_any_groups?(Group.where(id: [group2]))).to be_falsy
      expect(user2.in_any_groups?(Group.where(id: [group1, group2]))).to be_truthy
      expect(user3.in_any_groups?(Group.where(id: [group1, group2]))).to be_falsey
    end
  end
end
