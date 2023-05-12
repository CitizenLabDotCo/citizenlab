# frozen_string_literal: true

require 'rails_helper'

describe SmartGroups::Rules::CustomFieldNumber do
  describe 'validations' do
    let(:custom_field) { create(:custom_field_number) }

    let(:valid_json_rule) do
      {
        'ruleType' => 'custom_field_number',
        'customFieldId' => custom_field.id,
        'predicate' => 'is_smaller_than',
        'value' => 42
      }
    end
    let(:valid_rule) { described_class.from_json(valid_json_rule) }

    it 'successfully validates a valid rule' do
      expect(valid_rule).to be_valid
      expect(build(:smart_group, rules: [valid_json_rule])).to be_valid
    end
  end

  describe 'filter' do
    context 'on a number field' do
      let(:custom_field) { create(:custom_field_number, required: false) }

      let!(:users) do
        users = build_list(:user, 5)
        users[0].custom_field_values[custom_field.key] = 42
        users[1].custom_field_values[custom_field.key] = 3.14
        users[2].custom_field_values[custom_field.key] = 43
        users[3].custom_field_values[custom_field.key] = -72.6
        # users[4].custom_field_values[custom_field.key] = nil
        users.each(&:save!)
      end

      it "correctly filters on 'is_equal' predicate" do
        rule = described_class.new(custom_field.id, 'is_equal', 42)
        expect(rule.filter(User).count).to eq 1
      end

      it "correctly filters on 'not_is_equal' predicate" do
        rule = described_class.new(custom_field.id, 'not_is_equal', 42)
        expect(rule.filter(User).count).to eq 4
      end

      it "correctly filters on 'is_larger_than' predicate" do
        rule = described_class.new(custom_field.id, 'is_larger_than', 42)
        expect(rule.filter(User).count).to eq 1
      end

      it "correctly filters on 'is_larger_than_or_equal' predicate" do
        rule = described_class.new(custom_field.id, 'is_larger_than_or_equal', 42)
        expect(rule.filter(User).count).to eq 2
      end

      it "correctly filters on 'is_smaller_than' predicate" do
        rule = described_class.new(custom_field.id, 'is_smaller_than', 42)
        expect(rule.filter(User).count).to eq 2
      end

      it "correctly filters on 'is_smaller_than_or_equal' predicate" do
        rule = described_class.new(custom_field.id, 'is_smaller_than_or_equal', 42)
        expect(rule.filter(User).count).to eq 3
      end

      it "correctly filters on 'is_empty' predicate" do
        rule = described_class.new(custom_field.id, 'is_empty')
        expect(rule.filter(User).count).to eq 1
      end

      it "correctly filters on 'not_is_empty' predicate" do
        rule = described_class.new(custom_field.id, 'not_is_empty')
        expect(rule.filter(User).count).to eq 4
      end
    end
  end

  describe 'description_multiloc' do
    let(:number_picker) do
      create(:custom_field_number, title_multiloc: {
        'en' => 'How many politicians do you need to solve climate change?',
        'fr-BE' => 'Combien de politicians faut-il pour resoudre le changement du climat?',
        'nl-BE' => 'Hoeveel politici heb je nodig om klimaatsverandering op te lossen?'
      })
    end

    let(:custom_field_number_is_equal_rule) do
      described_class.from_json({
        'ruleType' => 'custom_field_number',
        'predicate' => 'is_equal',
        'customFieldId' => number_picker.id,
        'value' => 0
      })
    end
    let(:custom_field_number_not_is_equal_rule) do
      described_class.from_json({
        'ruleType' => 'custom_field_number',
        'predicate' => 'not_is_equal',
        'customFieldId' => number_picker.id,
        'value' => 0
      })
    end
    let(:custom_field_number_is_larger_than_rule) do
      described_class.from_json({
        'ruleType' => 'custom_field_number',
        'predicate' => 'is_larger_than',
        'customFieldId' => number_picker.id,
        'value' => 0
      })
    end
    let(:custom_field_number_is_larger_than_or_equal_rule) do
      described_class.from_json({
        'ruleType' => 'custom_field_number',
        'predicate' => 'is_larger_than_or_equal',
        'customFieldId' => number_picker.id,
        'value' => 0
      })
    end
    let(:custom_field_number_is_smaller_than_rule) do
      described_class.from_json({
        'ruleType' => 'custom_field_number',
        'predicate' => 'is_smaller_than',
        'customFieldId' => number_picker.id,
        'value' => 0
      })
    end
    let(:custom_field_number_is_smaller_than_or_equal_rule) do
      described_class.from_json({
        'ruleType' => 'custom_field_number',
        'predicate' => 'is_smaller_than_or_equal',
        'customFieldId' => number_picker.id,
        'value' => 0
      })
    end
    let(:custom_field_number_is_empty_rule) do
      described_class.from_json({
        'ruleType' => 'custom_field_number',
        'predicate' => 'is_empty',
        'customFieldId' => number_picker.id
      })
    end
    let(:custom_field_number_not_is_empty_rule) do
      described_class.from_json({
        'ruleType' => 'custom_field_number',
        'predicate' => 'not_is_empty',
        'customFieldId' => number_picker.id
      })
    end

    it 'successfully translates different combinations of rules' do
      expect(custom_field_number_is_equal_rule.description_multiloc).to eq({
        'en' => 'How many politicians do you need to solve climate change? equals 0',
        'fr-BE' => 'Combien de politicians faut-il pour resoudre le changement du climat? est égal à 0',
        'nl-BE' => 'Hoeveel politici heb je nodig om klimaatsverandering op te lossen? is gelijk aan 0'
      })
      expect(custom_field_number_not_is_equal_rule.description_multiloc).to eq({
        'en' => 'How many politicians do you need to solve climate change? doesn\'t equal 0',
        'fr-BE' => 'Combien de politicians faut-il pour resoudre le changement du climat? n\'est pas égal à 0',
        'nl-BE' => 'Hoeveel politici heb je nodig om klimaatsverandering op te lossen? is verschillend van 0'
      })
      expect(custom_field_number_is_larger_than_rule.description_multiloc).to eq({
        'en' => 'How many politicians do you need to solve climate change? is larger than 0',
        'fr-BE' => 'Combien de politicians faut-il pour resoudre le changement du climat? est plus grand que 0',
        'nl-BE' => 'Hoeveel politici heb je nodig om klimaatsverandering op te lossen? is groter dan 0'
      })
      expect(custom_field_number_is_larger_than_or_equal_rule.description_multiloc).to eq({
        'en' => 'How many politicians do you need to solve climate change? is larger than or equals 0',
        'fr-BE' => 'Combien de politicians faut-il pour resoudre le changement du climat? est plus grand ou égal à 0',
        'nl-BE' => 'Hoeveel politici heb je nodig om klimaatsverandering op te lossen? is groter dan of gelijk aan 0'
      })
      expect(custom_field_number_is_smaller_than_rule.description_multiloc).to eq({
        'en' => 'How many politicians do you need to solve climate change? is smaller than 0',
        'fr-BE' => 'Combien de politicians faut-il pour resoudre le changement du climat? est moins que 0',
        'nl-BE' => 'Hoeveel politici heb je nodig om klimaatsverandering op te lossen? is kleiner dan 0'
      })
      expect(custom_field_number_is_smaller_than_or_equal_rule.description_multiloc).to eq({
        'en' => 'How many politicians do you need to solve climate change? is smaller than or equals 0',
        'fr-BE' => 'Combien de politicians faut-il pour resoudre le changement du climat? est moins ou égal à 0',
        'nl-BE' => 'Hoeveel politici heb je nodig om klimaatsverandering op te lossen? is kleiner dan of gelijk aan 0'
      })
      expect(custom_field_number_is_empty_rule.description_multiloc).to eq({
        'en' => 'How many politicians do you need to solve climate change? has no value',
        'fr-BE' => 'Combien de politicians faut-il pour resoudre le changement du climat? n\'as pas de value',
        'nl-BE' => 'Hoeveel politici heb je nodig om klimaatsverandering op te lossen? heeft geen waarde'
      })
      expect(custom_field_number_not_is_empty_rule.description_multiloc).to eq({
        'en' => 'How many politicians do you need to solve climate change? has any value',
        'fr-BE' => 'Combien de politicians faut-il pour resoudre le changement du climat? peut avoir n\'importe quel value',
        'nl-BE' => 'Hoeveel politici heb je nodig om klimaatsverandering op te lossen? heeft om het even welke waarde'
      })
    end
  end
end
