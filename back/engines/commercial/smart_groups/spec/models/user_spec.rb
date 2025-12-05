# frozen_string_literal: true

require 'rails_helper'

RSpec.describe User do
  describe 'groups and group_ids' do
    let!(:manual_group) { create(:group) }
    let!(:rules_group) do
      create(:smart_group, rules: [
        { ruleType: 'email', predicate: 'is', value: 'user@test.com' }
      ])
    end

    it 'returns rule groups' do
      user = create(:user, email: 'user@test.com')
      expect(user.groups).to contain_exactly(rules_group)
      expect(user.group_ids).to contain_exactly(rules_group.id)
    end

    it 'returns manual groups and rule groups' do
      user = create(:user, manual_groups: [manual_group], email: 'user@test.com')
      expect(user.groups).to contain_exactly(manual_group, rules_group)
      expect(user.group_ids).to contain_exactly(manual_group.id, rules_group.id)
    end
  end

  describe 'in_group' do
    it 'gets all users in a rules group' do
      group = create(:smart_group)
      users = [
        create(:user, email: 'jos@test.com'),
        create(:user, email: 'jules@test.com'),
        create(:user),
        create(:user, manual_groups: [create(:group)])
      ]

      expect(described_class.in_group(group).pluck(:id)).to contain_exactly(users[0].id, users[1].id)
    end
  end

  describe 'in_any_group' do
    it 'gets the union of all users in the given groups' do
      group1 = create(:smart_group)
      group2 = create(:group)
      user1 = create(:user, email: 'jos@test.com', manual_groups: [group2])
      user2 = create(:user, email: 'jules@test.com')
      create(:user)
      user4 = create(:user, manual_groups: [group2])

      expect(described_class.in_any_group([group1, group2])).to contain_exactly(user1, user2, user4)
    end
  end

  describe 'in_any_groups?' do
    it 'returns truety iff the user is a member of one of the given groups' do
      group1 = create(:smart_group)
      group2 = create(:group)
      user1 = create(:user, email: 'jos@test.com', manual_groups: [group2])
      user2 = create(:user, email: 'jules@test.com')
      user3 = create(:user, email: 'jules@something.com')

      expect(user1.in_any_groups?(Group.where(id: group1))).to be true
      expect(user1.in_any_groups?(Group.where(id: group2))).to be true
      expect(user1.in_any_groups?(Group.where(id: [group1, group2]))).to be true
      expect(user1.in_any_groups?(Group.none)).to be false
      expect(user2.in_any_groups?(Group.where(id: [group1]))).to be true
      expect(user2).not_to be_in_any_groups(Group.where(id: [group2]))
      expect(user2.in_any_groups?(Group.where(id: [group1, group2]))).to be true
      expect(user3.in_any_groups?(Group.where(id: [group1, group2]))).to be false
    end
  end
end
