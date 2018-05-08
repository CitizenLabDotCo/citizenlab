require "rails_helper"

describe SmartGroupRules::CustomFieldCheckbox do


  describe "validations" do

    let(:custom_field) { create(:custom_field_checkbox) }

    let(:valid_json_rule) {{
      'ruleType' => 'custom_field_checkbox',
      'customFieldId' => custom_field.id,
      'predicate' => 'is_checked'
    }}
    let(:valid_rule) { SmartGroupRules::CustomFieldCheckbox.from_json(valid_json_rule) }

    it "successfully validate the valid rule" do
      expect(valid_rule).to be_valid
    end
  end

  describe "filter" do

    context "on a checkbox field" do

      let(:custom_field) { create(:custom_field_checkbox) }

      let!(:users) {
        users = build_list(:user, 5)
        users[0].custom_field_values[custom_field.key] = true
        users[1].custom_field_values[custom_field.key] = false # nil
        users[2].custom_field_values[custom_field.key] = true
        users[3].custom_field_values[custom_field.key] = false
        users[4].custom_field_values[custom_field.key] = false # nil
        users.each(&:save!)
      }

      it "correctly filters on 'is_checked' predicate" do
        rule = SmartGroupRules::CustomFieldCheckbox.new(custom_field.id, 'is_checked')
        expect(rule.filter(User).count).to eq 2
      end

      it "correctly filters on 'not_is_checked' predicate" do
        rule = SmartGroupRules::CustomFieldCheckbox.new(custom_field.id, 'not_is_checked')
        expect(rule.filter(User).count).to eq 3
      end
    end
 
  end

end