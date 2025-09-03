# frozen_string_literal: true

require 'rails_helper'

describe SmartGroups::Rules::Verified do
  let(:valid_json_rule) do
    {
      'ruleType' => 'verified',
      'predicate' => 'is_verified'
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
    end
  end

  describe 'filter' do
    let!(:users) do
      users = build_list(:user, 3)
      users[0].verified = true
      users[1].verified = false
      users[2].verified = true
      users.each(&:save!)
    end

    it "correctly filters on 'is_verified' predicate" do
      rule = described_class.new('is_verified')
      expect(rule.filter(User).count).to eq 2
    end

    it "correctly filters on 'not_is_verified' predicate" do
      rule = described_class.new('not_is_verified')
      expect(rule.filter(User).count).to eq User.count - 2
    end
  end
end
