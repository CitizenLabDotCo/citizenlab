# frozen_string_literal: true

require 'rails_helper'

describe SmartGroups::RulesService do
  let(:service) { described_class.new }
  let(:metaschema) { JSON::Validator.validator_for_name('draft4').metaschema }

  let(:cf1) { create(:custom_field) }
  let(:cf2) { create(:custom_field) }
  let(:cf3) { create(:custom_field_select) }
  let(:options) { create_list(:custom_field_option, 3, custom_field: cf3) }
  let!(:users) do
    users = build_list(:admin, 4)
    users[0].custom_field_values[cf1.key] = 'one'
    users[0].custom_field_values[cf2.key] = 'a'
    users[0].custom_field_values[cf3.key] = options[0].key

    users[1].custom_field_values[cf1.key] = 'three'
    users[1].custom_field_values[cf2.key] = 'a'
    users[1].custom_field_values[cf3.key] = options[0].key

    users[2].custom_field_values[cf1.key] = 'three'
    users[2].custom_field_values[cf2.key] = 'a'
    users[2].custom_field_values[cf3.key] = options[1].key

    users[3].custom_field_values[cf1.key] = 'four'
    users[3].custom_field_values[cf2.key] = 'a'
    users[3].custom_field_values[cf3.key] = options[2].key

    users.each(&:save)
  end

  let(:rules) do
    [
      { 'ruleType' => 'custom_field_text', 'customFieldId' => cf1.id, 'predicate' => 'is', 'value' => 'three' },
      { 'ruleType' => 'custom_field_text', 'customFieldId' => cf2.id, 'predicate' => 'is', 'value' => 'a' },
      { 'ruleType' => 'custom_field_select', 'customFieldId' => cf3.id, 'predicate' => 'has_value', 'value' => options[1].id },
      { 'ruleType' => 'role', 'predicate' => 'is_admin' }
    ]
  end

  describe 'generate_rules_json_schema' do
    let!(:cf1) { create(:custom_field) }

    it 'generates a valid json schema' do
      schema = service.generate_rules_json_schema
      expect(JSON::Validator.validate!(metaschema, schema)).to be true
    end

    it 'successfully validates various valid rules' do
      schema = service.generate_rules_json_schema
      expect(JSON::Validator.validate!(schema, rules)).to be true
    end

    it 'successfully validates valid custom field date rule' do
      schema = service.generate_rules_json_schema
      invalid_rule = {
        'ruleType' => 'custom_field_date',
        'customFieldId' => create(:custom_field_date).id,
        'predicate' => 'is_before',
        'value' => '2018-05-04'
      }
      expect(JSON::Validator.validate(schema, [invalid_rule])).to be true
    end

    it 'rejects invalid custom field date rule' do
      schema = service.generate_rules_json_schema
      invalid_rule = {
        'ruleType' => 'custom_field_date',
        'customFieldId' => create(:custom_field_date).id,
        'predicate' => 'is_before',
        'value' => 'garbage'
      }
      expect(JSON::Validator.validate(schema, [invalid_rule])).to be false
    end
  end

  describe 'filter' do
    it 'filters users with a combination of diverse rules' do
      result = service.filter User, rules
      expect(result.count).to eq 1
    end

    context 'voting' do
      let(:project1) { create(:single_voting_phase, :ongoing).project }
      let(:project2) { create(:single_voting_phase, :ongoing).project }

      let(:rules) do
        [
          { 'ruleType' => 'participated_in_project', 'predicate' => 'not_voted_in', 'value' => project1.id },
          { 'ruleType' => 'participated_in_project', 'predicate' => 'not_voted_in', 'value' => project2.id }
        ]
      end

      it 'includes all users who have not voted in any of the projects' do
        result = service.filter User, rules
        expect(result.count).to eq 4
      end

      it 'filters out users who have voted in at least one of the projects' do
        # 3 baskets, 2 users have voted in at least one project
        create(:basket, phase: project1.phases.first, user: User.first)
        create(:basket, phase: project2.phases.first, user: User.last)
        create(:basket, phase: project2.phases.first, user: User.last)

        result = service.filter User, rules
        expect(result.count).to eq 2
      end
    end
  end

  describe 'groups_for_user' do
    let!(:group1) { create(:smart_group, rules: [{ ruleType: 'email', predicate: 'is', value: 'me@test.com' }]) }
    let!(:group2) { create(:smart_group, rules: [{ ruleType: 'email', predicate: 'contains', value: 'me' }]) }
    let!(:group3) { create(:smart_group, rules: [{ ruleType: 'email', predicate: 'is', value: 'you@test.org' }]) }
    let!(:user) { create(:user, email: 'me@test.com') }

    it 'returns only the rules groups the user is part of' do
      groups = service.groups_for_user(user)
      expect(groups.map(&:id)).to contain_exactly(group1.id, group2.id)
    end

    it 'uses a maximum of 3 queries' do
      # 1 for calculating the cache key
      # 2 for the smart group filtering
      expect { service.groups_for_user(user) }.not_to exceed_query_limit(3)
    end

    it 'accepts an optional scope to limit the groups to search in' do
      groups = Group.where(id: [group2, group3])
      expect(service.groups_for_user(user, groups)).to eq([group2])
    end
  end
end
