require "rails_helper"

describe SmartGroupRules::CustomFieldText do

  let(:valid_json_rule) {{
    'ruleType' => 'custom_field_text',
    'customFieldId' => create(:custom_field).id,
    'predicate' => 'is',
    'value' => 'high'
  }}
  let(:valid_rule) { SmartGroupRules::CustomFieldText.from_json(valid_json_rule) }

  describe "from_json" do

    it "successfully parses a valid json" do
      expect(valid_rule.custom_field_id).to eq valid_json_rule['customFieldId']
      expect(valid_rule.predicate).to eq valid_json_rule['predicate']
      expect(valid_rule.value).to eq valid_json_rule['value']
    end

  end

  describe "validations" do
    it "successfully validate the valid rule" do
      expect(valid_rule).to be_valid
    end

    it "fails on a non-existing custom field" do
      expect(valid_rule.tap{|r| r.custom_field_id='garbage'}).to be_invalid
    end
  end

  describe "filter" do

    let(:custom_field) { create(:custom_field) }
    let!(:users) {
      users = build_list(:user, 5)
      users[0].custom_field_values[custom_field.key] = 'one'
      users[1].custom_field_values[custom_field.key] = 'two'
      users[2].custom_field_values[custom_field.key] = 'three'
      users[3].custom_field_values[custom_field.key] = 'four'
      users[4].custom_field_values[custom_field.key] = 'five'
      users.each(&:save)
    }

    it "correctly filters on 'is' predicate" do
      rule = SmartGroupRules::CustomFieldText.new(custom_field.id, 'is', 'two')
      expect(rule.filter(User).count).to eq 1 
    end

    it "correctly filters on 'not_is' predicate" do
      rule = SmartGroupRules::CustomFieldText.new(custom_field.id, 'not_is', 'two')
      expect(rule.filter(User).count).to eq User.count - 1
    end

    it "correctly filters on 'contains' predicate" do
      rule = SmartGroupRules::CustomFieldText.new(custom_field.id, 'contains', 'hre')
      expect(rule.filter(User).count).to eq 1 
    end

    it "correctly filters on 'not_contains' predicate" do
      rule = SmartGroupRules::CustomFieldText.new(custom_field.id, 'not_contains', 'hre')
      expect(rule.filter(User).count).to eq User.count - 1
    end

    it "correctly filters on 'begins_with' predicate" do
      rule = SmartGroupRules::CustomFieldText.new(custom_field.id, 'begins_with', 'f')
      expect(rule.filter(User).count).to eq 2
    end

    it "correctly filters on 'not_begins_with' predicate" do
      rule = SmartGroupRules::CustomFieldText.new(custom_field.id, 'not_begins_with', 'fiv')
      expect(rule.filter(User).count).to eq User.count - 1
    end

    it "correctly filters on 'ends_on' predicate" do
      rule = SmartGroupRules::CustomFieldText.new(custom_field.id, 'ends_on', 'e')
      expect(rule.filter(User).count).to eq 3
    end

    it "correctly filters on 'not_ends_on' predicate" do
      rule = SmartGroupRules::CustomFieldText.new(custom_field.id, 'not_ends_on', 'three')
      expect(rule.filter(User).count).to eq User.count - 1
    end

    it "correctly filters on 'is_empty' predicate" do
      rule = SmartGroupRules::CustomFieldText.new(custom_field.id, 'is_empty')
      expect(rule.filter(User).count).to eq 0
    end

    it "correctly filters on 'not_is_empty' predicate" do
      rule = SmartGroupRules::CustomFieldText.new(custom_field.id, 'not_is_empty')
      expect(rule.filter(User).count).to eq User.count
    end
  end

  describe "description_multiloc" do
    let(:text_field) {create(:custom_field, title_multiloc: {
      'en'    => 'What\'s your favourite Star Wars quote?',
      'fr-FR' => 'Quelle est votre citation Star Wars préférée?',
      'nl-NL' => 'Wat is uw favoriete Star Wars citaat?'
    })}
    
    let(:custom_field_text_is_rule) {SmartGroupRules::CustomFieldText.from_json({
      'ruleType'      => 'custom_field_text',
      'predicate'     => 'is',
      'customFieldId' => text_field.id,
      'value'         => 'Never tell me the odds'
    })}
    let(:custom_field_date_not_is_rule) {SmartGroupRules::CustomFieldText.from_json({
      'ruleType'      => 'custom_field_text',
      'predicate'     => 'not_is',
      'customFieldId' => number_picker.id,
      'value'         => 0
    })}
    let(:custom_field_date_is_larger_than_rule) {SmartGroupRules::CustomFieldText.from_json({
      'ruleType'      => 'custom_field_date',
      'predicate'     => 'is_larger_than',
      'customFieldId' => number_picker.id,
      'value'         => 0
    })}
    let(:custom_field_date_not_is_larger_than_rule) {SmartGroupRules::CustomFieldText.from_json({
      'ruleType'      => 'custom_field_date',
      'predicate'     => 'not_is_larger_than',
      'customFieldId' => number_picker.id,
      'value'         => 0
    })}
    let(:custom_field_date_is_smaller_than_rule) {SmartGroupRules::CustomFieldText.from_json({
      'ruleType'      => 'custom_field_date',
      'predicate'     => 'is_smaller_than',
      'customFieldId' => number_picker.id,
      'value'         => 0
    })}
    let(:custom_field_date_not_is_smaller_than_rule) {SmartGroupRules::CustomFieldText.from_json({
      'ruleType'      => 'custom_field_date',
      'predicate'     => 'not_is_smaller_than',
      'customFieldId' => number_picker.id,
      'value'         => 0
    })}
    let(:custom_field_date_is_empty_rule) {SmartGroupRules::CustomFieldText.from_json({
      'ruleType'      => 'custom_field_date',
      'predicate'     => 'is_empty',
      'customFieldId' => number_picker.id
    })}
    let(:custom_field_date_not_is_empty_rule) {SmartGroupRules::CustomFieldText.from_json({
      'ruleType'      => 'custom_field_date',
      'predicate'     => 'not_is_empty',
      'customFieldId' => number_picker.id
    })}

    it "successfully translates different combinations of rules" do
      # Stubbing the translations so the specs don't depend on those.
      I18n.load_path += Dir[Rails.root.join('spec', 'fixtures', 'locales', '*.yml')]

      expect(custom_field_text_is_rule.description_multiloc).to eq ({
        'en'    => '\'What\'s your favourite Star Wars quote?\' is \'Never tell me the odds\'',
        'fr-FR' => '\'Quelle est votre citation Star Wars préférée?\' est \'Never tell me the odds\'',
        'nl-NL' => '\'Wat is uw favoriete Star Wars citaat?\' is \'Never tell me the odds\''
      })
      # expect(custom_field_date_not_is_equal_rule.description_multiloc).to eq ({
      #   'en'    => '\'How many politicians do you need to solve climate change?\' doesn\'t equal 0',
      #   'fr-FR' => '\'Combien de politicians faut-il pour resoudre le changement du climat?\' n\'est pas égal à 0',
      #   'nl-NL' => '\'Hoeveel politici heb je nodig om klimaatsverandering op te lossen?\' is verschillend van 0'
      # })
      # expect(custom_field_date_is_larger_than_rule.description_multiloc).to eq ({
      #   'en'    => '\'How many politicians do you need to solve climate change?\' is larger than 0',
      #   'fr-FR' => '\'Combien de politicians faut-il pour resoudre le changement du climat?\' est plus grand que 0',
      #   'nl-NL' => '\'Hoeveel politici heb je nodig om klimaatsverandering op te lossen?\' is groter dan 0'
      # })
      # expect(custom_field_date_not_is_larger_than_rule.description_multiloc).to eq ({
      #   'en'    => '\'How many politicians do you need to solve climate change?\' is not larger than 0',
      #   'fr-FR' => '\'Combien de politicians faut-il pour resoudre le changement du climat?\' n\'est pas plus grand que 0',
      #   'nl-NL' => '\'Hoeveel politici heb je nodig om klimaatsverandering op te lossen?\' is niet groter dan 0'
      # })
      # expect(custom_field_date_is_smaller_than_rule.description_multiloc).to eq ({
      #   'en'    => '\'How many politicians do you need to solve climate change?\' is smaller than 0',
      #   'fr-FR' => '\'Combien de politicians faut-il pour resoudre le changement du climat?\' est moins que 0',
      #   'nl-NL' => '\'Hoeveel politici heb je nodig om klimaatsverandering op te lossen?\' is kleiner dan 0'
      # })
      # expect(custom_field_date_not_is_smaller_than_rule.description_multiloc).to eq ({
      #   'en'    => '\'How many politicians do you need to solve climate change?\' is not smaller than 0',
      #   'fr-FR' => '\'Combien de politicians faut-il pour resoudre le changement du climat?\' n\'est pas moins que 0',
      #   'nl-NL' => '\'Hoeveel politici heb je nodig om klimaatsverandering op te lossen?\' is niet kleiner dan 0'
      # })
      # expect(custom_field_date_is_empty_rule.description_multiloc).to eq ({
      #   'en'    => '\'How many politicians do you need to solve climate change?\' has no value',
      #   'fr-FR' => '\'Combien de politicians faut-il pour resoudre le changement du climat?\' n\'as pas de value',
      #   'nl-NL' => '\'Hoeveel politici heb je nodig om klimaatsverandering op te lossen?\' heeft geen waarde'
      # })
      # expect(custom_field_date_not_is_empty_rule.description_multiloc).to eq ({
      #   'en'    => '\'How many politicians do you need to solve climate change?\' has any value',
      #   'fr-FR' => '\'Combien de politicians faut-il pour resoudre le changement du climat?\' peut avoir n\'importe quel value',
      #   'nl-NL' => '\'Hoeveel politici heb je nodig om klimaatsverandering op te lossen?\' heeft om het even welke waarde'
      # })
    end
  end

end