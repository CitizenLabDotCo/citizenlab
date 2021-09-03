require "rails_helper"

describe SmartGroups::Rules::CustomFieldCheckbox do


  describe "validations" do

    let(:custom_field) { create(:custom_field_checkbox) }

    let(:valid_json_rule) {{
      'ruleType' => 'custom_field_checkbox',
      'customFieldId' => custom_field.id,
      'predicate' => 'is_checked'
    }}
    let(:valid_rule) { SmartGroups::Rules::CustomFieldCheckbox.from_json(valid_json_rule) }

    it "successfully validate the valid rule" do
      expect(valid_rule).to be_valid
      expect(build(:smart_group, rules: [valid_json_rule])).to be_valid
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
        rule = SmartGroups::Rules::CustomFieldCheckbox.new(custom_field.id, 'is_checked')
        expect(rule.filter(User).count).to eq 2
      end

      it "correctly filters on 'not_is_checked' predicate" do
        rule = SmartGroups::Rules::CustomFieldCheckbox.new(custom_field.id, 'not_is_checked')
        expect(rule.filter(User).count).to eq 3
      end
    end

  end

  describe "description_multiloc" do
    let(:checkbox) {create(:custom_field_checkbox, title_multiloc: {
      'en'    => 'I agree to share my cookies',
      'fr-FR' => 'J\'accepte de partager mes biscuits',
      'nl-NL' => 'Ik ga akkoord om mijn koekjes te delen'
    })}

    let(:custom_field_checkbox_is_checked_rule) {SmartGroups::Rules::CustomFieldCheckbox.from_json({
      'ruleType'      => 'custom_field_checkbox',
      'predicate'     => 'is_checked',
      'customFieldId' => checkbox.id
    })}
    let(:custom_field_checkbox_not_is_checked_rule) {SmartGroups::Rules::CustomFieldCheckbox.from_json({
      'ruleType'      => 'custom_field_checkbox',
      'predicate'     => 'not_is_checked',
      'customFieldId' => checkbox.id
    })}

    it "successfully translates different combinations of rules" do
      expect(custom_field_checkbox_is_checked_rule.description_multiloc).to eq ({
        'en'    => 'Checked I agree to share my cookies',
        'fr-FR' => 'A coché J\'accepte de partager mes biscuits',
        'nl-NL' => 'Heeft Ik ga akkoord om mijn koekjes te delen aangevinkt'
      })
      expect(custom_field_checkbox_not_is_checked_rule.description_multiloc).to eq ({
        'en'    => 'Didn\'t check I agree to share my cookies',
        'fr-FR' => 'N\'as pas coché J\'accepte de partager mes biscuits',
        'nl-NL' => 'Heeft Ik ga akkoord om mijn koekjes te delen niet aangevinkt'
      })
    end
  end

end
