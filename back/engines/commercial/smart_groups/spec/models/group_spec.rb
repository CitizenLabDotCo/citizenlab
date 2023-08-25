# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Group do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:group)).to be_valid
    end
  end

  describe 'users (members)' do
    it 'can not be added to rules groups' do
      g = create(:smart_group)
      expect { g.add_member create(:user) }.to raise_error(RuntimeError)
    end

    it 'can not be deleted from rules groups' do
      g = create(:smart_group)
      expect { g.remove_member create(:user) }.to raise_error(RuntimeError)
    end

    it 'has consistent responses between member and member_ids for manual groups' do
      g1 = create(:group)
      g1.members << create_list(:user, 5)
      expect(g1.member_ids).to match g1.members.map(&:id)
    end

    it 'has consistent responses between member and member_ids for smart groups' do
      g1 = create(:smart_group)
      create(:user, email: 'u1@test.com')
      create(:user, email: 'u2@test.com')
      create(:user, email: 'u3@not-in-group.com')
      expect(g1.member_ids).to match g1.members.map(&:id)
    end
  end

  describe 'using_custom_field scope' do
    let(:cf1) { create(:custom_field_select) }
    let(:cf2) { create(:custom_field) }
    let!(:group1) do
      create(:smart_group, rules: [
        { ruleType: 'email', predicate: 'ends_on', value: '@citizenlab.co' },
        { ruleType: 'custom_field_select', customFieldId: cf1.id, predicate: 'is_empty' }
      ])
    end
    let!(:group2) { create(:group) }
    let!(:group3) do
      create(:smart_group, rules: [
        { ruleType: 'custom_field_text', customFieldId: cf2.id, predicate: 'is', value: 'abc' }
      ])
    end

    it 'returns exactly the rules groups that reference the given custom field' do
      expect(described_class.using_custom_field(cf1).all).to match [group1]
      expect(described_class.using_custom_field(cf2).all).to match [group3]
    end
  end

  describe 'using_custom_field_option scope' do
    let(:cf1) { create(:custom_field_select) }
    let!(:cfo1) { create_list(:custom_field_option, 3, custom_field: cf1) }
    let(:cf2) { create(:custom_field_select) }
    let!(:cfo2) { create_list(:custom_field_option, 3, custom_field: cf2) }

    let!(:group1) do
      create(:smart_group, rules: [
        { ruleType: 'email', predicate: 'ends_on', value: '@citizenlab.co' },
        { ruleType: 'custom_field_select', customFieldId: cf1.id, predicate: 'has_value',
          value: cfo1[0].id }
      ])
    end
    let!(:group2) { create(:group) }
    let!(:group3) do
      create(:smart_group, rules: [
        { ruleType: 'custom_field_select', customFieldId: cf2.id, predicate: 'has_value', value: cfo2[1].id }
      ])
    end

    it 'returns exactly the rules groups that reference the given custom field option' do
      expect(described_class.using_custom_field_option(cfo1[0]).all).to match [group1]
      expect(described_class.using_custom_field_option(cfo1[1]).all).to match []
      expect(described_class.using_custom_field_option(cfo1[2]).all).to match []
      expect(described_class.using_custom_field_option(cfo2[0]).all).to match []
      expect(described_class.using_custom_field_option(cfo2[1]).all).to match [group3]
      expect(described_class.using_custom_field_option(cfo2[2]).all).to match []
    end
  end

  describe 'update_memberships_count!' do
    it 'updates the membership count for a rules group' do
      group = create(:smart_group)
      create(:user, email: 'jos@test.com')
      create(:user, email: 'jef@test.com')
      expect(group).to receive(:update).with({ memberships_count: 2 })
      group.update_memberships_count!
    end
  end

  describe 'a smart group with many rules' do
    let(:custom_field) { create(:custom_field_select) }
    let(:options) { create_list(:custom_field_option, 3, custom_field: custom_field) }
    let!(:group) do
      create(:smart_group, rules: [
        { ruleType: 'custom_field_select', customFieldId: custom_field.id, predicate: 'has_value',
          value: options.first.id },
        { ruleType: 'custom_field_text', customFieldId: create(:custom_field).id, predicate: 'is',
          value: 'high' },
        { ruleType: 'role', predicate: 'is_admin' },
        { ruleType: 'email', predicate: 'ends_on', value: '@citizenlab.co' },
        { ruleType: 'follow', predicate: 'something' },
        { ruleType: 'lives_in', predicate: 'has_value', value: create(:area).id },
        { ruleType: 'custom_field_checkbox', customFieldId: create(:custom_field_checkbox).id,
          predicate: 'is_checked' },
        { ruleType: 'custom_field_date', customFieldId: create(:custom_field_date).id, predicate: 'is_before',
          value: (Time.zone.today - 1.day) },
        { ruleType: 'registration_completed_at', predicate: 'is_before', value: (Time.zone.today - 1.day) },
        { ruleType: 'custom_field_number', customFieldId: create(:custom_field_number).id, predicate: 'is_smaller_than',
          value: 42 },
        { ruleType: 'participated_in_project', predicate: 'in', value: [create(:project).id] },
        { ruleType: 'participated_in_topic', predicate: 'in', value: [create(:topic).id] },
        { ruleType: 'participated_in_idea_status', predicate: 'in', value: [create(:idea_status).id] },
        { ruleType: 'verified', predicate: 'not_is_verified' }
      ])
    end
    let!(:user) { create(:user) }

    it 'still works' do
      expect { group.memberships_count }.not_to raise_error
    end
  end
end
