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

    pending "correctly filters on 'contains' predicate" do
      rule = SmartGroupRules::CustomFieldText.new(custom_field.id, 'contains', 'two')
      expect(rule.filter(User).count).to eq 1 
    end

    pending "correctly filters on 'not_contains' predicate" do
      rule = SmartGroupRules::CustomFieldText.new(custom_field.id, 'not_contains', 'two')
      expect(rule.filter(User).count).to eq 1 
    end

    pending "correctly filters on 'begins_with' predicate" do
      rule = SmartGroupRules::CustomFieldText.new(custom_field.id, 'begins_with', 'two')
      expect(rule.filter(User).count).to eq 1 
    end

    pending "correctly filters on 'not_begins_with' predicate" do
      rule = SmartGroupRules::CustomFieldText.new(custom_field.id, 'not_begins_with', 'two')
      expect(rule.filter(User).count).to eq 1 
    end

    pending "correctly filters on 'ends_on' predicate" do
      rule = SmartGroupRules::CustomFieldText.new(custom_field.id, 'ends_on', 'two')
      expect(rule.filter(User).count).to eq 1 
    end

    pending "correctly filters on 'not_ends_on' predicate" do
      rule = SmartGroupRules::CustomFieldText.new(custom_field.id, 'not_ends_on', 'two')
      expect(rule.filter(User).count).to eq 1 
    end

    pending "correctly filters on 'is_empty' predicate" do
      rule = SmartGroupRules::CustomFieldText.new(custom_field.id, 'is_empty', 'two')
      expect(rule.filter(User).count).to eq 1 
    end

    pending "correctly filters on 'not_is_empty' predicate" do
      rule = SmartGroupRules::CustomFieldText.new(custom_field.id, 'not_is_empty', 'two')
      expect(rule.filter(User).count).to eq 1 
    end
  end

end