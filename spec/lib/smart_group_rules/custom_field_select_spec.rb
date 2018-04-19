require "rails_helper"

describe SmartGroupRules::CustomFieldSelect do


  describe "validations" do

    let(:custom_field) { create(:custom_field_select) }
    let(:options) { create_list(:custom_field_option, 3, custom_field: custom_field )}

    let(:valid_json_rule) {{
      'ruleType' => 'custom_field_select',
      'customFieldId' => custom_field.id,
      'predicate' => 'has_value',
      'value' => options.first.id
    }}
    let(:valid_rule) { SmartGroupRules::CustomFieldSelect.from_json(valid_json_rule) }

    it "successfully validate the valid rule" do
      expect(valid_rule).to be_valid
    end

    it "fails on a non-existing custom field" do
      expect(valid_rule.tap{|r| r.custom_field_id='garbage'}).to be_invalid
    end

    it "fails on a non-existing custom field option" do
      expect(valid_rule.tap{|r| r.value='garbage'}).to be_invalid
    end

    it "fails on a custom field option from another custom field" do
      other_custom_field_option = create(:custom_field_option, custom_field: create(:custom_field_select))
      expect(valid_rule.tap{|r| r.value=other_custom_field_option.id}).to be_invalid
    end
  end

  describe "filter" do

    context "on a select field" do

      let(:custom_field) { create(:custom_field_select) }
      let(:options) { create_list(:custom_field_option, 3, custom_field: custom_field )}

      let!(:users) {
        users = build_list(:user, 5)
        users[0].custom_field_values[custom_field.key] = options[0].key
        users[1].custom_field_values[custom_field.key] = options[0].key
        users[2].custom_field_values[custom_field.key] = options[1].key
        users[3].custom_field_values[custom_field.key] = options[2].key
        users[4].custom_field_values[custom_field.key] = nil
        users.each(&:save)
      }

      it "correctly filters on 'has_value' predicate" do
        rule = SmartGroupRules::CustomFieldSelect.new(custom_field.id, 'has_value', options[0].id)
        expect(rule.filter(User).count).to eq 2 
      end

      it "correctly filters on 'not_has_value' predicate" do
        rule = SmartGroupRules::CustomFieldSelect.new(custom_field.id, 'not_has_value', options[1].id)
        expect(rule.filter(User).count).to eq User.count - 1
      end

      pending "correctly filters on 'is_empty' predicate" do
        rule = SmartGroupRules::CustomFieldSelect.new(custom_field.id, 'is_empty')
        expect(rule.filter(User).count).to eq 1 
      end

      pending "correctly filters on 'not_is_empty' predicate" do
        rule = SmartGroupRules::CustomFieldSelect.new(custom_field.id, 'not_is_empty')
        expect(rule.filter(User).count).to eq User.count - 1
      end

    end

    context "on a multiselect field" do


    end

 
  end

end