# frozen_string_literal: true

require 'rails_helper'

describe SmartGroups::Rules::Email do
  let(:valid_json_rule) do
    {
      'ruleType' => 'email',
      'predicate' => 'is',
      'value' => 'hello@citizenlab.co'
    }
  end
  let(:valid_rule) { described_class.from_json(valid_json_rule) }

  describe 'from_json' do
    it 'successfully parses a valid json' do
      expect(valid_rule.predicate).to eq valid_json_rule['predicate']
      expect(valid_rule.value).to eq valid_json_rule['value']
    end
  end

  describe 'validations' do
    let(:valid_json_list_rule) do
      {
        'ruleType' => 'email',
        'predicate' => 'is_one_of',
        'value' => %w[hello@citizenlab.co sebi@hotmail.com]
      }
    end

    it 'successfully validate the valid rule' do
      expect(valid_rule).to be_valid
      expect(build(:smart_group, rules: [valid_json_rule])).to be_valid
    end

    it 'successfully validates a list rule' do
      expect(described_class.from_json(valid_json_list_rule)).to be_valid
      expect(build(:smart_group, rules: [valid_json_list_rule])).to be_valid
    end

    it 'rejects a single value for a list predicate' do
      rule = described_class.new('is_one_of', 'hello@citizenlab.co')

      expect(rule).to be_invalid
      expect(build(:smart_group, rules: [valid_json_list_rule.merge('value' => 'hello@citizenlab.co')])).to be_invalid
    end

    it 'rejects a list for a single value predicate' do
      expect(described_class.new('is', %w[hello@citizenlab.co])).to be_invalid
      expect(build(:smart_group, rules: [valid_json_rule.merge('value' => %w[hello@citizenlab.co])])).to be_invalid
    end

    it 'rejects a list longer than the maximum' do
      values = Array.new(described_class::MAX_VALUES + 1) { |i| "user#{i}@citizenlab.co" }

      expect(described_class.new('is_one_of', values)).to be_invalid
      expect(build(:smart_group, rules: [valid_json_list_rule.merge('value' => values)])).to be_invalid
    end
  end

  describe 'filter' do
    let!(:users) do
      users = build_list(:user, 5)
      users[0].email = 'hello@citizenlab.co'
      users[1].email = 'sebastien@citizenlab.co'
      users[2].email = 'sebi@hotmail.com'
      users[3].email = 'bill@microsoft.com'
      users[4].email = 'gerard@yahoo.fr'
      users.each(&:save!)
    end

    it "correctly filters on 'is' predicate" do
      rule = described_class.new('is', 'sebi@hotmail.com')
      expect(rule.filter(User).count).to eq 1
    end

    it "correctly filters on 'not_is' predicate" do
      rule = described_class.new('not_is', 'sebi@hotmail.com')
      expect(rule.filter(User).count).to eq User.count - 1
    end

    it "correctly filters on 'contains' predicate" do
      rule = described_class.new('contains', 'll')
      expect(rule.filter(User).count).to eq 2
    end

    it "correctly filters on 'not_contains' predicate" do
      rule = described_class.new('not_contains', 'll')
      expect(rule.filter(User).count).to eq User.count - 2
    end

    it "correctly filters on 'begins_with' predicate" do
      rule = described_class.new('begins_with', 'gerard')
      expect(rule.filter(User).count).to eq 1
    end

    it "correctly filters on 'not_begins_with' predicate" do
      rule = described_class.new('not_begins_with', 'gerard')
      expect(rule.filter(User).count).to eq User.count - 1
    end

    it "correctly filters on 'ends_on' predicate" do
      rule = described_class.new('ends_on', 'citizenlab.co')
      expect(rule.filter(User).count).to eq 2
    end

    it "correctly filters on 'not_ends_on' predicate" do
      rule = described_class.new('not_ends_on', 'citizenlab.co')
      expect(rule.filter(User).count).to eq User.count - 2
    end

    it "correctly filters on 'is_one_of' predicate" do
      rule = described_class.new('is_one_of', %w[sebi@hotmail.com gerard@yahoo.fr nobody@citizenlab.co])
      expect(rule.filter(User).count).to eq 2
    end

    it "correctly filters on 'not_is_one_of' predicate" do
      rule = described_class.new('not_is_one_of', %w[sebi@hotmail.com gerard@yahoo.fr])
      expect(rule.filter(User).count).to eq User.count - 2
    end

    it "ignores casing and surrounding whitespace on the 'is_one_of' predicate" do
      rule = described_class.new('is_one_of', ['  SEBI@Hotmail.com ', 'Gerard@YAHOO.fr'])
      expect(rule.filter(User).count).to eq 2
    end

    it "includes users without an email on the 'not_is_one_of' predicate" do
      create(:user, email: nil, unique_code: '1234abcd')
      rule = described_class.new('not_is_one_of', %w[sebi@hotmail.com])

      expect(rule.filter(User).count).to eq User.count - 1
    end
  end

  describe 'description_multiloc' do
    let(:email_is_rule) do
      described_class.from_json({
        'ruleType' => 'email',
        'predicate' => 'is',
        'value' => 'sebi@citizenlab.co'
      })
    end
    let(:email_not_is_rule) do
      described_class.from_json({
        'ruleType' => 'email',
        'predicate' => 'not_is',
        'value' => 'sebi@citizenlab.co'
      })
    end
    let(:email_contains_rule) do
      described_class.from_json({
        'ruleType' => 'email',
        'predicate' => 'contains',
        'value' => '@citizenlab'
      })
    end
    let(:email_not_contains_rule) do
      described_class.from_json({
        'ruleType' => 'email',
        'predicate' => 'not_contains',
        'value' => '@citizenlab'
      })
    end
    let(:email_begins_with_rule) do
      described_class.from_json({
        'ruleType' => 'email',
        'predicate' => 'begins_with',
        'value' => 'sebi'
      })
    end
    let(:email_not_begins_with_rule) do
      described_class.from_json({
        'ruleType' => 'email',
        'predicate' => 'not_begins_with',
        'value' => 'sebi'
      })
    end
    let(:email_ends_on_rule) do
      described_class.from_json({
        'ruleType' => 'email',
        'predicate' => 'ends_on',
        'value' => 'citizenlab.co'
      })
    end
    let(:email_not_ends_on_rule) do
      described_class.from_json({
        'ruleType' => 'email',
        'predicate' => 'not_ends_on',
        'value' => 'citizenlab.co'
      })
    end

    it 'successfully translates different combinations of rules' do
      expect(email_is_rule.description_multiloc).to eq({
        'en' => 'e-mail is sebi@citizenlab.co',
        'fr-FR' => 'adresse e-mail est sebi@citizenlab.co',
        'nl-NL' => 'e-mail is sebi@citizenlab.co'
      })
      expect(email_not_is_rule.description_multiloc).to eq({
        'en' => 'e-mail is not sebi@citizenlab.co',
        'fr-FR' => 'adresse e-mail n\'est pas sebi@citizenlab.co',
        'nl-NL' => 'e-mail is niet sebi@citizenlab.co'
      })
      expect(email_contains_rule.description_multiloc).to eq({
        'en' => 'e-mail contains @citizenlab',
        'fr-FR' => 'adresse e-mail contient @citizenlab',
        'nl-NL' => 'e-mail bevat @citizenlab'
      })
      expect(email_not_contains_rule.description_multiloc).to eq({
        'en' => 'e-mail doesn\'t contain @citizenlab',
        'fr-FR' => 'adresse e-mail ne contient pas @citizenlab',
        'nl-NL' => 'e-mail bevat niet @citizenlab'
      })
      expect(email_begins_with_rule.description_multiloc).to eq({
        'en' => 'e-mail begins with sebi',
        'fr-FR' => 'adresse e-mail commence par sebi',
        'nl-NL' => 'e-mail begint op sebi'
      })
      expect(email_not_begins_with_rule.description_multiloc).to eq({
        'en' => 'e-mail doesn\'t begin with sebi',
        'fr-FR' => 'adresse e-mail ne commence pas par sebi',
        'nl-NL' => 'e-mail begint niet op sebi'
      })
      expect(email_ends_on_rule.description_multiloc).to eq({
        'en' => 'e-mail ends on citizenlab.co',
        'fr-FR' => 'adresse e-mail se termine sur citizenlab.co',
        'nl-NL' => 'e-mail eindigt op citizenlab.co'
      })
      expect(email_not_ends_on_rule.description_multiloc).to eq({
        'en' => 'e-mail doesn\'t end on citizenlab.co',
        'fr-FR' => 'adresse e-mail ne se termine pas sur citizenlab.co',
        'nl-NL' => 'e-mail eindigt niet op citizenlab.co'
      })
    end

    it 'describes the list predicates' do
      values = %w[sebi@citizenlab.co gerard@yahoo.fr]

      expect(described_class.new('is_one_of', values).description_multiloc['en'])
        .to eq 'e-mail is one of: sebi@citizenlab.co, gerard@yahoo.fr'
      expect(described_class.new('not_is_one_of', values).description_multiloc['en'])
        .to eq 'e-mail is not one of: sebi@citizenlab.co, gerard@yahoo.fr'
    end
  end
end
