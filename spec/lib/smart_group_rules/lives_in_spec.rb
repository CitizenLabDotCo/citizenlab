require "rails_helper"

describe SmartGroupRules::LivesIn do

  let(:valid_json_rule) {{
    'ruleType' => 'lives_in',
    'predicate' => 'has_value',
    'value' => create(:area).id
  }}
  let(:valid_rule) { SmartGroupRules::LivesIn.from_json(valid_json_rule) }

  describe "from_json" do

    it "successfully parses a valid json" do
      expect(valid_rule.predicate).to eq valid_json_rule['predicate']
      expect(valid_rule.value).to eq valid_json_rule['value']
    end

  end

  describe "validations" do
    it "successfully validate the valid rule" do
      expect(valid_rule).to be_valid
    end
  end

  describe "filter" do

    before do
      CustomField.create!(
        resource_type: 'User',
        key: 'domicile',
        title_multiloc: {'en' => 'Domicile'},
        input_type: 'select',
        required: false,
        ordering: 2,
        enabled: true,
        code: 'domicile'
      ) 
    end

    let!(:area1) { create(:area) }
    let!(:area2) { create(:area) }
    let!(:users) {
      users = build_list(:user, 5)
      users[0][:custom_field_values] = {'domicile' => 'outside'}
      users[1][:custom_field_values] = {'domicile' => area1.id}
      users[2][:custom_field_values] = {'domicile' => area2.id}
      users[3][:custom_field_values] = nil
      users[4][:custom_field_values] = {'domicile' => area1.id}
      users.each(&:save!)
    }

    it "correctly filters on 'has_value' predicate" do
      rule = SmartGroupRules::LivesIn.new('has_value', area1.id)
      expect(rule.filter(User).count).to eq 2
    end

    it "correctly filters on 'not_has_value' predicate" do
      rule = SmartGroupRules::LivesIn.new('not_has_value', 'outside')
      expect(rule.filter(User).count).to eq 4
    end

    it "correctly filters on 'is_empty' predicate" do
      rule = SmartGroupRules::LivesIn.new('is_empty')
      expect(rule.filter(User).count).to eq 1
    end

    it "correctly filters on 'not_is_empty' predicate" do
      rule = SmartGroupRules::LivesIn.new('not_is_empty')
      expect(rule.filter(User).count).to eq 4
    end
  end

end