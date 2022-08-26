# frozen_string_literal: true

require 'rails_helper'

describe SmartGroups::Rules::CustomFieldCheckbox do
  describe 'validations' do
    let(:custom_field) { create(:custom_field_checkbox) }

    let(:valid_json_rule) do
      {
        'ruleType' => 'custom_field_checkbox',
        'customFieldId' => custom_field.id,
        'predicate' => 'is_checked'
      }
    end
    let(:valid_rule) { described_class.from_json(valid_json_rule) }

    it 'successfully validate the valid rule' do
      expect(valid_rule).to be_valid
      expect(build(:smart_group, rules: [valid_json_rule])).to be_valid
    end
  end

  describe 'filter' do
    context 'on a checkbox field' do
      let(:custom_field) { create(:custom_field_checkbox) }

      let!(:users) do
        users = build_list(:user, 5)
        users[0].custom_field_values[custom_field.key] = true
        users[1].custom_field_values[custom_field.key] = false # nil
        users[2].custom_field_values[custom_field.key] = true
        users[3].custom_field_values[custom_field.key] = false
        users[4].custom_field_values[custom_field.key] = false # nil
        users.each(&:save!)
      end

      it "correctly filters on 'is_checked' predicate" do
        rule = described_class.new(custom_field.id, 'is_checked')
        expect(rule.filter(User).count).to eq 2
      end

      it "correctly filters on 'not_is_checked' predicate" do
        rule = described_class.new(custom_field.id, 'not_is_checked')
        expect(rule.filter(User).count).to eq 3
      end
    end
  end

  describe 'caching' do
    let(:custom_field) { create(:custom_field_checkbox) }

    let(:valid_json_rule) do
      {
        'ruleType' => 'custom_field_checkbox',
        'customFieldId' => custom_field.id,
        'predicate' => 'is_checked'
      }
    end

    let(:valid_rule) { described_class.from_json(valid_json_rule) }

    it 'is enabled' do
      expect(valid_rule).to be_cachable
    end

    it 'changes cache_key when predicate changes' do
      expect { valid_rule.predicate = 'not_is' }.to change(valid_rule, :cache_key)
    end

    it 'changes cache_key when value changes' do
      expect { valid_rule.value = 'example@example.com' }.to change(valid_rule, :cache_key)
    end

    it 'changes cache_key when custom_field_id changes' do
      expect { valid_rule.value = 'abcdef' }.to change(valid_rule, :cache_key)
    end

    it 'changes cache_key when users table changes' do
      expect { create(:user) }.to change(valid_rule, :cache_key)
    end
  end

  describe 'description_multiloc' do
    let(:checkbox) do
      create(:custom_field_checkbox, title_multiloc: {
        'en' => 'I agree to share my cookies',
        'fr-FR' => 'J\'accepte de partager mes biscuits',
        'nl-NL' => 'Ik ga akkoord om mijn koekjes te delen'
      })
    end

    let(:custom_field_checkbox_is_checked_rule) do
      described_class.from_json({
        'ruleType' => 'custom_field_checkbox',
        'predicate' => 'is_checked',
        'customFieldId' => checkbox.id
      })
    end
    let(:custom_field_checkbox_not_is_checked_rule) do
      described_class.from_json({
        'ruleType' => 'custom_field_checkbox',
        'predicate' => 'not_is_checked',
        'customFieldId' => checkbox.id
      })
    end

    it 'successfully translates different combinations of rules' do
      expect(custom_field_checkbox_is_checked_rule.description_multiloc).to eq({
        'en' => 'Checked I agree to share my cookies',
        'fr-FR' => 'A coché J\'accepte de partager mes biscuits',
        'nl-NL' => 'Heeft Ik ga akkoord om mijn koekjes te delen aangevinkt'
      })
      expect(custom_field_checkbox_not_is_checked_rule.description_multiloc).to eq({
        'en' => 'Didn\'t check I agree to share my cookies',
        'fr-FR' => 'N\'as pas coché J\'accepte de partager mes biscuits',
        'nl-NL' => 'Heeft Ik ga akkoord om mijn koekjes te delen niet aangevinkt'
      })
    end
  end
end
