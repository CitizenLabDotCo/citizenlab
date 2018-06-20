require "rails_helper"

describe SmartGroupRules::CustomFieldNumber do


  describe "validations" do

    let(:custom_field) { create(:custom_field_number) }

    let(:valid_json_rule) {{
      'ruleType' => 'custom_field_number',
      'customFieldId' => custom_field.id,
      'predicate' => 'is_smaller_than',
      'value' => 42
    }}
    let(:valid_rule) { SmartGroupRules::CustomFieldNumber.from_json(valid_json_rule) }

    it "successfully validates a valid rule" do
      expect(valid_rule).to be_valid
    end
  end

  describe "filter" do

    context "on a number field" do

      let(:custom_field) { create(:custom_field_number, required: false) }

      let!(:users) {
        users = build_list(:user, 5)
        users[0].custom_field_values[custom_field.key] = 42
        users[1].custom_field_values[custom_field.key] = 3.14
        users[2].custom_field_values[custom_field.key] = 43
        users[3].custom_field_values[custom_field.key] = -72.6
        # users[4].custom_field_values[custom_field.key] = nil
        users.each(&:save!)
      }

      it "correctly filters on 'is_equal' predicate" do
        rule = SmartGroupRules::CustomFieldNumber.new(custom_field.id, 'is_equal', 42)
        expect(rule.filter(User).count).to eq 1
      end

      it "correctly filters on 'not_is_equal' predicate" do
        rule = SmartGroupRules::CustomFieldNumber.new(custom_field.id, 'not_is_equal', 42)
        expect(rule.filter(User).count).to eq 4
      end

      it "correctly filters on 'is_larger_than' predicate" do
        rule = SmartGroupRules::CustomFieldNumber.new(custom_field.id, 'is_larger_than', 42)
        expect(rule.filter(User).count).to eq 1
      end

      it "correctly filters on 'is_larger_than_or_equal' predicate" do
        rule = SmartGroupRules::CustomFieldNumber.new(custom_field.id, 'is_larger_than_or_equal', 42)
        expect(rule.filter(User).count).to eq 2
      end

      it "correctly filters on 'is_smaller_than' predicate" do
        rule = SmartGroupRules::CustomFieldNumber.new(custom_field.id, 'is_smaller_than', 42)
        expect(rule.filter(User).count).to eq 2
      end

      it "correctly filters on 'is_smaller_than_or_equal' predicate" do
        rule = SmartGroupRules::CustomFieldNumber.new(custom_field.id, 'is_smaller_than_or_equal', 42)
        expect(rule.filter(User).count).to eq 3
      end

      it "correctly filters on 'is_empty' predicate" do
        rule = SmartGroupRules::CustomFieldNumber.new(custom_field.id, 'is_empty')
        expect(rule.filter(User).count).to eq 1 
      end

      it "correctly filters on 'not_is_empty' predicate" do
        rule = SmartGroupRules::CustomFieldNumber.new(custom_field.id, 'not_is_empty')
        expect(rule.filter(User).count).to eq 4
      end

    end
 
  end

end