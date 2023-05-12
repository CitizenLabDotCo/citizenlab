# frozen_string_literal: true

require 'rails_helper'

describe SmartGroups::Rules::CustomFieldText do
  let(:valid_json_rule) do
    {
      'ruleType' => 'custom_field_text',
      'customFieldId' => create(:custom_field).id,
      'predicate' => 'is',
      'value' => 'high'
    }
  end
  let(:valid_rule) { described_class.from_json(valid_json_rule) }

  describe 'from_json' do
    it 'successfully parses a valid json' do
      expect(valid_rule.custom_field_id).to eq valid_json_rule['customFieldId']
      expect(valid_rule.predicate).to eq valid_json_rule['predicate']
      expect(valid_rule.value).to eq valid_json_rule['value']
    end
  end

  describe 'validations' do
    it 'successfully validate the valid rule' do
      expect(valid_rule).to be_valid
    end

    it 'fails on a non-existing custom field' do
      expect(valid_rule.tap { |r| r.custom_field_id = 'garbage' }).to be_invalid
    end
  end

  describe 'filter' do
    let(:custom_field) { create(:custom_field) }
    let!(:users) do
      users = build_list(:user, 5)
      users[0].custom_field_values[custom_field.key] = 'one'
      users[1].custom_field_values[custom_field.key] = 'two'
      users[2].custom_field_values[custom_field.key] = 'three'
      users[3].custom_field_values[custom_field.key] = 'four'
      users[4].custom_field_values[custom_field.key] = 'five'
      users.each(&:save)
    end

    it "correctly filters on 'is' predicate" do
      rule = described_class.new(custom_field.id, 'is', 'two')
      expect(rule.filter(User).count).to eq 1
    end

    it "correctly filters on 'not_is' predicate" do
      rule = described_class.new(custom_field.id, 'not_is', 'two')
      expect(rule.filter(User).count).to eq User.count - 1
    end

    it "correctly filters on 'contains' predicate" do
      rule = described_class.new(custom_field.id, 'contains', 'hre')
      expect(rule.filter(User).count).to eq 1
    end

    it "correctly filters on 'not_contains' predicate" do
      rule = described_class.new(custom_field.id, 'not_contains', 'hre')
      expect(rule.filter(User).count).to eq User.count - 1
    end

    it "correctly filters on 'begins_with' predicate" do
      rule = described_class.new(custom_field.id, 'begins_with', 'f')
      expect(rule.filter(User).count).to eq 2
    end

    it "correctly filters on 'not_begins_with' predicate" do
      rule = described_class.new(custom_field.id, 'not_begins_with', 'fiv')
      expect(rule.filter(User).count).to eq User.count - 1
    end

    it "correctly filters on 'ends_on' predicate" do
      rule = described_class.new(custom_field.id, 'ends_on', 'e')
      expect(rule.filter(User).count).to eq 3
    end

    it "correctly filters on 'not_ends_on' predicate" do
      rule = described_class.new(custom_field.id, 'not_ends_on', 'three')
      expect(rule.filter(User).count).to eq User.count - 1
    end

    it "correctly filters on 'is_empty' predicate" do
      rule = described_class.new(custom_field.id, 'is_empty')
      expect(rule.filter(User).count).to eq 0
    end

    it "correctly filters on 'not_is_empty' predicate" do
      rule = described_class.new(custom_field.id, 'not_is_empty')
      expect(rule.filter(User).count).to eq User.count
    end
  end

  describe 'description_multiloc' do
    let(:text_field) do
      create(:custom_field, title_multiloc: {
        'en' => 'What\'s your favourite Star Wars quote?',
        'fr-BE' => 'Quelle est votre citation Star Wars préférée?',
        'nl-BE' => 'Wat is uw favoriete Star Wars citaat?'
      })
    end

    let(:custom_field_text_is_rule) do
      described_class.from_json({
        'ruleType' => 'custom_field_text',
        'predicate' => 'is',
        'customFieldId' => text_field.id,
        'value' => 'Never tell me the odds!'
      })
    end
    let(:custom_field_text_not_is_rule) do
      described_class.from_json({
        'ruleType' => 'custom_field_text',
        'predicate' => 'not_is',
        'customFieldId' => text_field.id,
        'value' => 'Never tell me the odds!'
      })
    end
    let(:custom_field_text_contains_rule) do
      described_class.from_json({
        'ruleType' => 'custom_field_text',
        'predicate' => 'contains',
        'customFieldId' => text_field.id,
        'value' => 'Never tell me the odds!'
      })
    end
    let(:custom_field_text_not_contains_rule) do
      described_class.from_json({
        'ruleType' => 'custom_field_text',
        'predicate' => 'not_contains',
        'customFieldId' => text_field.id,
        'value' => 'Never tell me the odds!'
      })
    end
    let(:custom_field_text_begins_with_rule) do
      described_class.from_json({
        'ruleType' => 'custom_field_text',
        'predicate' => 'begins_with',
        'customFieldId' => text_field.id,
        'value' => 'Never tell me the odds!'
      })
    end
    let(:custom_field_text_not_begins_with_rule) do
      described_class.from_json({
        'ruleType' => 'custom_field_text',
        'predicate' => 'not_begins_with',
        'customFieldId' => text_field.id,
        'value' => 'Never tell me the odds!'
      })
    end
    let(:custom_field_text_ends_on_rule) do
      described_class.from_json({
        'ruleType' => 'custom_field_text',
        'predicate' => 'ends_on',
        'customFieldId' => text_field.id,
        'value' => 'Never tell me the odds!'
      })
    end
    let(:custom_field_text_not_ends_on_rule) do
      described_class.from_json({
        'ruleType' => 'custom_field_text',
        'predicate' => 'not_ends_on',
        'customFieldId' => text_field.id,
        'value' => 'Never tell me the odds!'
      })
    end
    let(:custom_field_text_is_empty_rule) do
      described_class.from_json({
        'ruleType' => 'custom_field_text',
        'predicate' => 'is_empty',
        'customFieldId' => text_field.id
      })
    end
    let(:custom_field_text_not_is_empty_rule) do
      described_class.from_json({
        'ruleType' => 'custom_field_text',
        'predicate' => 'not_is_empty',
        'customFieldId' => text_field.id
      })
    end

    it 'successfully translates different combinations of rules' do
      expect(custom_field_text_is_rule.description_multiloc).to eq({
        'en' => 'What\'s your favourite Star Wars quote? is Never tell me the odds!',
        'fr-BE' => 'Quelle est votre citation Star Wars préférée? est Never tell me the odds!',
        'nl-BE' => 'Wat is uw favoriete Star Wars citaat? is Never tell me the odds!'
      })
      expect(custom_field_text_not_is_rule.description_multiloc).to eq({
        'en' => 'What\'s your favourite Star Wars quote? is not Never tell me the odds!',
        'fr-BE' => 'Quelle est votre citation Star Wars préférée? n\'est pas Never tell me the odds!',
        'nl-BE' => 'Wat is uw favoriete Star Wars citaat? is niet Never tell me the odds!'
      })
      expect(custom_field_text_contains_rule.description_multiloc).to eq({
        'en' => 'What\'s your favourite Star Wars quote? contains Never tell me the odds!',
        'fr-BE' => 'Quelle est votre citation Star Wars préférée? contient Never tell me the odds!',
        'nl-BE' => 'Wat is uw favoriete Star Wars citaat? bevat Never tell me the odds!'
      })
      expect(custom_field_text_not_contains_rule.description_multiloc).to eq({
        'en' => 'What\'s your favourite Star Wars quote? doesn\'t contain Never tell me the odds!',
        'fr-BE' => 'Quelle est votre citation Star Wars préférée? ne contient pas Never tell me the odds!',
        'nl-BE' => 'Wat is uw favoriete Star Wars citaat? bevat niet Never tell me the odds!'
      })
      expect(custom_field_text_begins_with_rule.description_multiloc).to eq({
        'en' => 'What\'s your favourite Star Wars quote? begins with Never tell me the odds!',
        'fr-BE' => 'Quelle est votre citation Star Wars préférée? commence par Never tell me the odds!',
        'nl-BE' => 'Wat is uw favoriete Star Wars citaat? begint op Never tell me the odds!'
      })
      expect(custom_field_text_not_begins_with_rule.description_multiloc).to eq({
        'en' => 'What\'s your favourite Star Wars quote? doesn\'t begin with Never tell me the odds!',
        'fr-BE' => 'Quelle est votre citation Star Wars préférée? ne commence pas par Never tell me the odds!',
        'nl-BE' => 'Wat is uw favoriete Star Wars citaat? begint niet op Never tell me the odds!'
      })
      expect(custom_field_text_ends_on_rule.description_multiloc).to eq({
        'en' => 'What\'s your favourite Star Wars quote? ends on Never tell me the odds!',
        'fr-BE' => 'Quelle est votre citation Star Wars préférée? se termine sur Never tell me the odds!',
        'nl-BE' => 'Wat is uw favoriete Star Wars citaat? eindigt op Never tell me the odds!'
      })
      expect(custom_field_text_not_ends_on_rule.description_multiloc).to eq({
        'en' => 'What\'s your favourite Star Wars quote? doesn\'t end on Never tell me the odds!',
        'fr-BE' => 'Quelle est votre citation Star Wars préférée? ne se termine pas sur Never tell me the odds!',
        'nl-BE' => 'Wat is uw favoriete Star Wars citaat? eindigt niet op Never tell me the odds!'
      })
      expect(custom_field_text_is_empty_rule.description_multiloc).to eq({
        'en' => 'What\'s your favourite Star Wars quote? has no value',
        'fr-BE' => 'Quelle est votre citation Star Wars préférée? n\'as pas de value',
        'nl-BE' => 'Wat is uw favoriete Star Wars citaat? heeft geen waarde'
      })
      expect(custom_field_text_not_is_empty_rule.description_multiloc).to eq({
        'en' => 'What\'s your favourite Star Wars quote? has any value',
        'fr-BE' => 'Quelle est votre citation Star Wars préférée? peut avoir n\'importe quel value',
        'nl-BE' => 'Wat is uw favoriete Star Wars citaat? heeft om het even welke waarde'
      })
    end
  end
end
