require "rails_helper"

describe SmartGroups::Rules::Email do

  let(:valid_json_rule) {{
    'ruleType' => 'email',
    'predicate' => 'is',
    'value' => 'hello@citizenlab.co'
  }}
  let(:valid_rule) { SmartGroups::Rules::Email.from_json(valid_json_rule) }

  describe "from_json" do

    it "successfully parses a valid json" do
      expect(valid_rule.predicate).to eq valid_json_rule['predicate']
      expect(valid_rule.value).to eq valid_json_rule['value']
    end

  end

  describe "validations" do
    it "successfully validate the valid rule" do
      expect(valid_rule).to be_valid
      expect(build(:smart_group, rules: [valid_json_rule])).to be_valid
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
      rule = SmartGroups::Rules::Email.new('is', 'sebi@hotmail.com')
      expect(rule.filter(User).count).to eq 1
    end

    it "correctly filters on 'not_is' predicate" do
      rule = SmartGroups::Rules::Email.new('not_is', 'sebi@hotmail.com')
      expect(rule.filter(User).count).to eq User.count - 1
    end

    it "correctly filters on 'contains' predicate" do
      rule = SmartGroups::Rules::Email.new('contains', 'll')
      expect(rule.filter(User).count).to eq 2
    end

    it "correctly filters on 'not_contains' predicate" do
      rule = SmartGroups::Rules::Email.new('not_contains', 'll')
      expect(rule.filter(User).count).to eq User.count - 2
    end

    it "correctly filters on 'begins_with' predicate" do
      rule = SmartGroups::Rules::Email.new('begins_with', 'gerard')
      expect(rule.filter(User).count).to eq 1
    end

    it "correctly filters on 'not_begins_with' predicate" do
      rule = SmartGroups::Rules::Email.new('not_begins_with', 'gerard')
      expect(rule.filter(User).count).to eq User.count - 1
    end

    it "correctly filters on 'ends_on' predicate" do
      rule = SmartGroups::Rules::Email.new('ends_on', 'citizenlab.co')
      expect(rule.filter(User).count).to eq 2
    end

    it "correctly filters on 'not_ends_on' predicate" do
      rule = SmartGroups::Rules::Email.new('not_ends_on', 'citizenlab.co')
      expect(rule.filter(User).count).to eq User.count - 2
    end
  end

  describe "description_multiloc" do
    let(:email_is_rule) {SmartGroups::Rules::Email.from_json({
      'ruleType'      => 'email',
      'predicate'     => 'is',
      'value'         => 'sebi@citizenlab.co'
    })}
    let(:email_not_is_rule) {SmartGroups::Rules::Email.from_json({
      'ruleType'      => 'email',
      'predicate'     => 'not_is',
      'value'         => 'sebi@citizenlab.co'
    })}
    let(:email_contains_rule) {SmartGroups::Rules::Email.from_json({
      'ruleType'      => 'email',
      'predicate'     => 'contains',
      'value'         => '@citizenlab'
    })}
    let(:email_not_contains_rule) {SmartGroups::Rules::Email.from_json({
      'ruleType'      => 'email',
      'predicate'     => 'not_contains',
      'value'         => '@citizenlab'
    })}
    let(:email_begins_with_rule) {SmartGroups::Rules::Email.from_json({
      'ruleType'      => 'email',
      'predicate'     => 'begins_with',
      'value'         => 'sebi'
    })}
    let(:email_not_begins_with_rule) {SmartGroups::Rules::Email.from_json({
      'ruleType'      => 'email',
      'predicate'     => 'not_begins_with',
      'value'         => 'sebi'
    })}
    let(:email_ends_on_rule) {SmartGroups::Rules::Email.from_json({
      'ruleType'      => 'email',
      'predicate'     => 'ends_on',
      'value'         => 'citizenlab.co'
    })}
    let(:email_not_ends_on_rule) {SmartGroups::Rules::Email.from_json({
      'ruleType'      => 'email',
      'predicate'     => 'not_ends_on',
      'value'         => 'citizenlab.co'
    })}

    it "successfully translates different combinations of rules" do
      expect(email_is_rule.description_multiloc).to eq ({
        'en'    => 'e-mail is sebi@citizenlab.co',
        'fr-FR' => 'adresse e-mail est sebi@citizenlab.co',
        'nl-NL' => 'e-mail is sebi@citizenlab.co'
      })
      expect(email_not_is_rule.description_multiloc).to eq ({
        'en'    => 'e-mail is not sebi@citizenlab.co',
        'fr-FR' => 'adresse e-mail n\'est pas sebi@citizenlab.co',
        'nl-NL' => 'e-mail is niet sebi@citizenlab.co'
      })
      expect(email_contains_rule.description_multiloc).to eq ({
        'en'    => 'e-mail contains @citizenlab',
        'fr-FR' => 'adresse e-mail contient @citizenlab',
        'nl-NL' => 'e-mail bevat @citizenlab'
      })
      expect(email_not_contains_rule.description_multiloc).to eq ({
        'en'    => 'e-mail doesn\'t contain @citizenlab',
        'fr-FR' => 'adresse e-mail ne contient pas @citizenlab',
        'nl-NL' => 'e-mail bevat niet @citizenlab'
      })
      expect(email_begins_with_rule.description_multiloc).to eq ({
        'en'    => 'e-mail begins with sebi',
        'fr-FR' => 'adresse e-mail commence par sebi',
        'nl-NL' => 'e-mail begint op sebi'
      })
      expect(email_not_begins_with_rule.description_multiloc).to eq ({
        'en'    => 'e-mail doesn\'t begin with sebi',
        'fr-FR' => 'adresse e-mail ne commence pas par sebi',
        'nl-NL' => 'e-mail begint niet op sebi'
      })
      expect(email_ends_on_rule.description_multiloc).to eq ({
        'en'    => 'e-mail ends on citizenlab.co',
        'fr-FR' => 'adresse e-mail se termine sur citizenlab.co',
        'nl-NL' => 'e-mail eindigt op citizenlab.co'
      })
      expect(email_not_ends_on_rule.description_multiloc).to eq ({
        'en'    => 'e-mail doesn\'t end on citizenlab.co',
        'fr-FR' => 'adresse e-mail ne se termine pas sur citizenlab.co',
        'nl-NL' => 'e-mail eindigt niet op citizenlab.co'
      })
    end
  end

end
