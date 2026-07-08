# frozen_string_literal: true

require 'rails_helper'

describe SmartGroups::Rules::Imported do
  let(:valid_json_rule) do
    {
      'ruleType' => 'imported',
      'predicate' => 'is_imported'
    }
  end
  let(:valid_rule) { described_class.from_json(valid_json_rule) }

  describe 'from_json' do
    it 'successfully parses a valid json' do
      expect(valid_rule.predicate).to eq valid_json_rule['predicate']
    end
  end

  describe 'validations' do
    it 'successfully validate the valid rule' do
      expect(valid_rule).to be_valid
      expect(build(:smart_group, rules: [valid_json_rule])).to be_valid
    end
  end

  describe 'filter' do
    let!(:users) do
      users = build_list(:user, 3)
      users[0].imported = true
      users[1].imported = false
      users[2].imported = true
      users.each(&:save!)
    end

    it "correctly filters on 'is_imported' predicate" do
      rule = described_class.new('is_imported')
      expect(rule.filter(User).count).to eq 2
    end

    it "correctly filters on 'is_not_imported' predicate" do
      rule = described_class.new('is_not_imported')
      expect(rule.filter(User).count).to eq User.count - 2
    end
  end

  describe 'description_multiloc' do
    it 'successfully translates the rules' do
      expect(described_class.new('is_imported').description_multiloc).to include(
        'en' => 'User was imported'
      )
      expect(described_class.new('is_not_imported').description_multiloc).to include(
        'en' => 'User was not imported'
      )
    end
  end
end
