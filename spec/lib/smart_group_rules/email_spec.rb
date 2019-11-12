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

  describe "description_multiloc" do
    let(:email_is_rule) {SmartGroupRules::Email.from_json({
      'ruleType'      => 'email',
      'predicate'     => 'is',
      'value'         => 'sebi@citizenlab.co'
    })}
    let(:email_not_is_rule) {SmartGroupRules::Email.from_json({
      'ruleType'      => 'email',
      'predicate'     => 'not_is',
      'value'         => 'sebi@citizenlab.co'
    })}
    let(:email_contains_rule) {SmartGroupRules::Email.from_json({
      'ruleType'      => 'email',
      'predicate'     => 'contains',
      'value'         => '@citizenlab'
    })}
    let(:email_not_contains_rule) {SmartGroupRules::Email.from_json({
      'ruleType'      => 'email',
      'predicate'     => 'not_contains',
      'value'         => '@citizenlab'
    })}
    let(:email_begins_with_rule) {SmartGroupRules::Email.from_json({
      'ruleType'      => 'email',
      'predicate'     => 'begins_with',
      'value'         => 'sebi'
    })}
    let(:email_not_begins_with_rule) {SmartGroupRules::Email.from_json({
      'ruleType'      => 'email',
      'predicate'     => 'not_begins_with',
      'value'         => 'sebi'
    })}
    let(:email_ends_on_rule) {SmartGroupRules::Email.from_json({
      'ruleType'      => 'email',
      'predicate'     => 'ends_on',
      'value'         => 'citizenlab.co'
    })}
    let(:email_not_ends_on_rule) {SmartGroupRules::Email.from_json({
      'ruleType'      => 'email',
      'predicate'     => 'not_ends_on',
      'value'         => 'citizenlab.co'
    })}

    it "successfully translates different combinations of rules" do
      # Stubbing the translations so the specs don't depend on those.
      I18n.load_path += Dir[Rails.root.join('spec', 'fixtures', 'locales', '*.yml')]

      expect(email_is_rule.description_multiloc).to eq ({
        'en'    => 'email is \'Never tell me the odds!\'',
        'fr-FR' => 'corrier électronique est \'Never tell me the odds!\'',
        'nl-NL' => 'email is \'Never tell me the odds!\''
      })
      expect(email_not_is_rule.description_multiloc).to eq ({
        'en'    => 'email is not \'Never tell me the odds!\'',
        'fr-FR' => 'corrier électronique n\'est pas \'Never tell me the odds!\'',
        'nl-NL' => 'email is niet \'Never tell me the odds!\''
      })
      expect(email_contains_rule.description_multiloc).to eq ({
        'en'    => 'email contains \'Never tell me the odds!\'',
        'fr-FR' => 'corrier électronique contient \'Never tell me the odds!\'',
        'nl-NL' => 'email bevat \'Never tell me the odds!\''
      })
      expect(email_not_contains_rule.description_multiloc).to eq ({
        'en'    => 'email doesn\'t contain \'Never tell me the odds!\'',
        'fr-FR' => 'corrier électronique ne contient pas \'Never tell me the odds!\'',
        'nl-NL' => 'email bevat niet \'Never tell me the odds!\''
      })
      expect(email_begins_with_rule.description_multiloc).to eq ({
        'en'    => 'email begins with \'Never tell me the odds!\'',
        'fr-FR' => 'corrier électronique commence par \'Never tell me the odds!\'',
        'nl-NL' => 'email begint op \'Never tell me the odds!\''
      })
      expect(email_not_begins_with_rule.description_multiloc).to eq ({
        'en'    => 'email doesn\'t begin with \'Never tell me the odds!\'',
        'fr-FR' => 'corrier électronique ne commence pas par \'Never tell me the odds!\'',
        'nl-NL' => 'email begint niet op \'Never tell me the odds!\''
      })
      expect(email_ends_on_rule.description_multiloc).to eq ({
        'en'    => 'email ends on \'Never tell me the odds!\'',
        'fr-FR' => 'corrier électronique se termine sur \'Never tell me the odds!\'',
        'nl-NL' => 'email eindigt op \'Never tell me the odds!\''
      })
      expect(email_not_ends_on_rule.description_multiloc).to eq ({
        'en'    => 'email doesn\'t end on \'Never tell me the odds!\'',
        'fr-FR' => 'corrier électronique ne se termine pas sur \'Never tell me the odds!\'',
        'nl-NL' => 'email eindigt niet op \'Never tell me the odds!\''
      })
    end
  end

end