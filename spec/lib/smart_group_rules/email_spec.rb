require "rails_helper"

describe SmartGroupRules::Email do

  let(:valid_json_rule) {{
    'ruleType' => 'email',
    'predicate' => 'is',
    'value' => 'hello@citizenlab.co'
  }}
  let(:valid_rule) { SmartGroupRules::Email.from_json(valid_json_rule) }

  describe "from_json" do

    it "successfully parses a valid json" do
      expect(valid_rule.predicate).to eq valid_json_rule['predicate']
      expect(valid_rule.value).to eq valid_json_rule['value']
    end

  end

  describe "validations" do
    it "successfully validate the valid rule" do
      expect(valid_rule).to be_valid
    end
  end

  describe "filter" do

    let!(:users) {
      users = build_list(:user, 5)
      users[0].email = 'hello@citizenlab.co'
      users[1].email = 'sebastien@citizenlab.co'
      users[2].email = 'sebi@hotmail.com'
      users[3].email = 'bill@microsoft.com'
      users[4].email = 'gerard@yahoo.fr'
      users.each(&:save!)
    }

    it "correctly filters on 'is' predicate" do
      rule = SmartGroupRules::Email.new('is', 'sebi@hotmail.com')
      expect(rule.filter(User).count).to eq 1 
    end

    it "correctly filters on 'not_is' predicate" do
      rule = SmartGroupRules::Email.new('not_is', 'sebi@hotmail.com')
      expect(rule.filter(User).count).to eq User.count - 1
    end

    it "correctly filters on 'contains' predicate" do
      rule = SmartGroupRules::Email.new('contains', 'll')
      expect(rule.filter(User).count).to eq 2
    end

    it "correctly filters on 'not_contains' predicate" do
      rule = SmartGroupRules::Email.new('not_contains', 'll')
      expect(rule.filter(User).count).to eq User.count - 2
    end

    it "correctly filters on 'begins_with' predicate" do
      rule = SmartGroupRules::Email.new('begins_with', 'gerard')
      expect(rule.filter(User).count).to eq 1
    end

    it "correctly filters on 'not_begins_with' predicate" do
      rule = SmartGroupRules::Email.new('not_begins_with', 'gerard')
      expect(rule.filter(User).count).to eq User.count - 1
    end

    it "correctly filters on 'ends_on' predicate" do
      rule = SmartGroupRules::Email.new('ends_on', 'citizenlab.co')
      expect(rule.filter(User).count).to eq 2
    end

    it "correctly filters on 'not_ends_on' predicate" do
      rule = SmartGroupRules::Email.new('not_ends_on', 'citizenlab.co')
      expect(rule.filter(User).count).to eq User.count - 2
    end
  end

end