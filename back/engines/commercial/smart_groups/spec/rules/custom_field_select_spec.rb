# frozen_string_literal: true

require 'rails_helper'

describe SmartGroups::Rules::CustomFieldSelect do
  describe 'validations' do
    let(:custom_field) { create(:custom_field_select) }
    let(:options) { create_list(:custom_field_option, 3, custom_field: custom_field) }

    let(:valid_json_rule) do
      {
        'ruleType' => 'custom_field_select',
        'customFieldId' => custom_field.id,
        'predicate' => 'has_value',
        'value' => options.first.id
      }
    end
    let(:valid_rule) { described_class.from_json(valid_json_rule) }

    it 'successfully validate the valid rule' do
      expect(valid_rule).to be_valid
      expect(build(:smart_group, rules: [valid_rule.as_json])).to be_valid
    end

    it 'fails on a non-existing custom field' do
      rule = valid_rule.tap { |r| r.custom_field_id = 'garbage' }
      expect(rule).to be_invalid
      expect(build(:smart_group, rules: [rule.as_json])).to be_invalid
    end

    it 'fails on a non-existing custom field option' do
      rule = valid_rule.tap { |r| r.value = 'garbage' }
      expect(rule).to be_invalid
      expect(build(:smart_group, rules: [rule.as_json])).to be_invalid
    end

    it 'fails on a custom field option from another custom field' do
      other_custom_field_option = create(:custom_field_option, custom_field: create(:custom_field_select))
      rule = valid_rule.tap { |r| r.value = other_custom_field_option.id }
      expect(rule).to be_invalid
      # TODO
      # expect(build(:smart_group, rules: [rule.as_json])).to be_invalid
    end

    it 'successfully validate the valid multi-value rule' do
      rule = valid_rule.tap do |r|
        r.predicate = 'is_one_of'
        r.value = [options.first.id, options.last.id]
      end
      expect(rule).to be_valid
      expect(build(:smart_group, rules: [rule.as_json])).to be_valid
    end

    it 'fails on a non-existing custom field option' do
      rule = valid_rule.tap do |r|
        r.predicate = 'is_one_of'
        r.value = [options.first.id, 'garbage']
      end
      expect(rule).to be_invalid
      expect(build(:smart_group, rules: [rule.as_json])).to be_invalid
    end
  end

  describe 'filter' do
    context 'on a select field' do
      let(:custom_field) { create(:custom_field_select, required: false) }
      let(:options) { create_list(:custom_field_option, 3, custom_field: custom_field) }

      let!(:users) do
        users = build_list(:user, 5)
        users[0].custom_field_values[custom_field.key] = options[0].key
        users[1].custom_field_values[custom_field.key] = options[0].key
        users[2].custom_field_values[custom_field.key] = options[1].key
        users[3].custom_field_values[custom_field.key] = options[2].key
        # users[4].custom_field_values[custom_field.key] = nil
        users.each(&:save!)
      end

      it "correctly filters on 'has_value' predicate" do
        rule = described_class.new(custom_field.id, 'has_value', options[0].id)
        expect(rule.filter(User).count).to eq 2
      end

      it "correctly filters on 'not_has_value' predicate" do
        rule = described_class.new(custom_field.id, 'not_has_value', options[1].id)
        expect(rule.filter(User).count).to eq User.count - 1
      end

      it "correctly filters on 'is_one_of' predicate" do
        rule = described_class.new(custom_field.id, 'is_one_of', [options[0].id, options[2].id])
        expect(rule.filter(User).count).to eq 3
      end

      it "correctly filters on 'not_is_one_of' predicate" do
        rule = described_class.new(custom_field.id, 'not_is_one_of', [options[0].id])
        expect(rule.filter(User).count).to eq User.count - 2
      end

      it "correctly filters on 'is_empty' predicate" do
        rule = described_class.new(custom_field.id, 'is_empty')
        expect(rule.filter(User).count).to eq 1
      end

      it "correctly filters on 'not_is_empty' predicate" do
        rule = described_class.new(custom_field.id, 'not_is_empty')
        expect(rule.filter(User).count).to eq User.count - 1
      end
    end

    context 'on a multiselect field' do
      let(:custom_field) { create(:custom_field_multiselect, required: false) }
      let(:options) { create_list(:custom_field_option, 3, custom_field: custom_field) }

      let!(:users) do
        users = build_list(:user, 5)
        users[0].custom_field_values[custom_field.key] = [options[0].key, options[1].key]
        users[1].custom_field_values[custom_field.key] = []
        users[2].custom_field_values[custom_field.key] = [options[1].key]
        users[3].custom_field_values[custom_field.key] = [options[2].key]
        # users[4].custom_field_values[custom_field.key] = nil
        users.each(&:save!)
      end

      it "correctly filters on 'has_value' predicate" do
        rule = described_class.new(custom_field.id, 'has_value', options[1].id)
        expect(rule.filter(User).count).to eq 2
      end

      it "correctly filters on 'not_has_value' predicate" do
        rule = described_class.new(custom_field.id, 'not_has_value', options[1].id)
        expect(rule.filter(User).count).to eq 3
      end

      it "correctly filters on 'is_one_of' predicate" do
        rule = described_class.new(custom_field.id, 'is_one_of', [options[0].id, options[2].id])
        expect(rule.filter(User).count).to eq 2
      end

      it "correctly filters on 'not_is_one_of' predicate" do
        rule = described_class.new(custom_field.id, 'not_is_one_of', [options[1].id])
        expect(rule.filter(User).count).to eq User.count - 2
      end

      it "correctly filters on 'is_empty' predicate" do
        rule = described_class.new(custom_field.id, 'is_empty')
        expect(rule.filter(User).count).to eq 2
      end

      it "correctly filters on 'not_is_empty' predicate" do
        rule = described_class.new(custom_field.id, 'not_is_empty')
        expect(rule.filter(User).count).to eq 3
      end
    end
  end

  describe 'description_multiloc' do
    let(:custom_field) do
      create(:custom_field_select, title_multiloc: {
        'en' => 'Where should we put the immigrants?',
        'fr-BE' => 'Où devrions-nous placer les immigrants?',
        'nl-BE' => 'Waar moeten we de immigraten plaatsen?'
      })
    end
    let(:train_station) do
      create(:custom_field_option, custom_field: custom_field, title_multiloc: {
        'en' => 'In the train station',
        'fr-BE' => 'Dans la gare',
        'nl-BE' => 'In het treinstation'
      })
    end
    let(:schools) do
      create(:custom_field_option, custom_field: custom_field, title_multiloc: {
        'en' => 'In schools',
        'fr-BE' => 'Dans les écoles',
        'nl-BE' => 'In scholen'
      })
    end

    let(:custom_field_select_has_value_rule) do
      described_class.from_json({
        'ruleType' => 'custom_field_select',
        'predicate' => 'has_value',
        'customFieldId' => custom_field.id,
        'value' => train_station.id
      })
    end
    let(:custom_field_select_not_has_value_rule) do
      described_class.from_json({
        'ruleType' => 'custom_field_select',
        'predicate' => 'not_has_value',
        'customFieldId' => custom_field.id,
        'value' => train_station.id
      })
    end
    let(:custom_field_select_is_one_of_rule) do
      described_class.from_json({
        'ruleType' => 'custom_field_select',
        'predicate' => 'is_one_of',
        'customFieldId' => custom_field.id,
        'value' => [train_station.id]
      })
    end
    let(:custom_field_select_not_is_one_of_rule) do
      described_class.from_json({
        'ruleType' => 'custom_field_select',
        'predicate' => 'not_is_one_of',
        'customFieldId' => custom_field.id,
        'value' => [train_station.id, schools.id]
      })
    end
    let(:custom_field_select_is_empty_rule) do
      described_class.from_json({
        'ruleType' => 'custom_field_select',
        'predicate' => 'is_empty',
        'customFieldId' => custom_field.id
      })
    end
    let(:custom_field_select_not_is_empty_rule) do
      described_class.from_json({
        'ruleType' => 'custom_field_select',
        'predicate' => 'not_is_empty',
        'customFieldId' => custom_field.id
      })
    end

    # TODO: test education: return education description instead of number

    it 'successfully translates different combinations of rules' do
      expect(custom_field_select_has_value_rule.description_multiloc).to eq({
        'en' => 'Where should we put the immigrants? is In the train station',
        'fr-BE' => 'Où devrions-nous placer les immigrants? est Dans la gare',
        'nl-BE' => 'Waar moeten we de immigraten plaatsen? is In het treinstation'
      })
      expect(custom_field_select_not_has_value_rule.description_multiloc).to eq({
        'en' => 'Where should we put the immigrants? isn\'t In the train station',
        'fr-BE' => 'Où devrions-nous placer les immigrants? n\'est pas Dans la gare',
        'nl-BE' => 'Waar moeten we de immigraten plaatsen? is niet In het treinstation'
      })
      expect(custom_field_select_is_one_of_rule.description_multiloc).to eq({
        'en' => 'Where should we put the immigrants? has one of the following values: In the train station',
        'fr-BE' => 'Où devrions-nous placer les immigrants? est un de: Dans la gare',
        'nl-BE' => 'Waar moeten we de immigraten plaatsen? heeft een van de volgende waarden: In het treinstation'
      })
      expect(custom_field_select_not_is_one_of_rule.description_multiloc).to eq({
        'en' => 'Where should we put the immigrants? does not have any of the follow values: In the train station, In schools',
        'fr-BE' => 'Où devrions-nous placer les immigrants? n\'est pas un de: Dans la gare, Dans les écoles',
        'nl-BE' => 'Waar moeten we de immigraten plaatsen? heeft geen van de volgende waarden: In het treinstation, In scholen'
      })
      expect(custom_field_select_is_empty_rule.description_multiloc).to eq({
        'en' => 'Where should we put the immigrants? has no value',
        'fr-BE' => 'Où devrions-nous placer les immigrants? n\'as pas de value',
        'nl-BE' => 'Waar moeten we de immigraten plaatsen? heeft geen waarde'
      })
      expect(custom_field_select_not_is_empty_rule.description_multiloc).to eq({
        'en' => 'Where should we put the immigrants? has any value',
        'fr-BE' => 'Où devrions-nous placer les immigrants? peut avoir n\'importe quel value',
        'nl-BE' => 'Waar moeten we de immigraten plaatsen? heeft om het even welke waarde'
      })
    end
  end
end
