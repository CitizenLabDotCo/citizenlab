require 'rails_helper'

describe Verification::SmartGroups::Rules::Verified do

  let(:valid_json_rule) {{
    'ruleType' => 'verified',
    'predicate' => 'is_verified'
  }}
  let(:valid_rule) { Verification::SmartGroups::Rules::Verified.from_json(valid_json_rule) }

  describe "from_json" do

    it "successfully parses a valid json" do
      expect(valid_rule.predicate).to eq valid_json_rule['predicate']
    end

  end

  describe "validations" do
    it "successfully validate the valid rule" do
      expect(valid_rule).to be_valid
    end
  end

  describe "filter" do

    let!(:users) {
      users = build_list(:user, 3)
      users[0].verified = true
      users[1].verified = false
      users[2].verified = true
      users.each(&:save!)
    }

    it "correctly filters on 'is_verified' predicate" do
      rule = Verification::SmartGroups::Rules::Verified.new('is_verified')
      expect(rule.filter(User).count).to eq 2
    end

    it "correctly filters on 'not_is_verified' predicate" do
      rule = Verification::SmartGroups::Rules::Verified.new('not_is_verified')
      expect(rule.filter(User).count).to eq User.count - 2
    end
  end

end
