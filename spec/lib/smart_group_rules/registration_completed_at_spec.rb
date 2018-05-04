require "rails_helper"

describe SmartGroupRules::RegistrationCompletedAt do


  describe "validations" do

    let(:valid_json_rule) {{
      'ruleType' => 'registration_completed_at',
      'predicate' => 'is_before',
      'value' => (Date.today - 1.day)
    }}
    let(:valid_rule) { SmartGroupRules::RegistrationCompletedAt.from_json(valid_json_rule) }

    it "successfully validate the valid rule" do
      expect(valid_rule).to be_valid
    end
  end

  describe "filter" do

    context "on registration completion date" do

      let!(:users) {
        users = build_list(:user, 5)
        users[0].registration_completed_at = Date.today
        users[1].registration_completed_at = (Date.today - 1.day)
        users[2].registration_completed_at = (Date.today + 1.day)
        users[3].registration_completed_at = (Date.today - 1.year)
        users[4].registration_completed_at = nil
        users.each(&:save!)
      }

      it "correctly filters on 'is_before' predicate" do
        rule = SmartGroupRules::RegistrationCompletedAt.new('is_before', Date.today)
        expect(rule.filter(User).count).to eq 2
      end

      it "correctly filters on 'is_after' predicate" do
        rule = SmartGroupRules::RegistrationCompletedAt.new('is_after', Date.today)
        expect(rule.filter(User).count).to eq 1
      end

      it "correctly filters on 'is_exactly' predicate" do
        rule = SmartGroupRules::RegistrationCompletedAt.new('is_exactly', Date.today)
        expect(rule.filter(User).count).to eq 1
      end

      it "correctly filters on 'is_empty' predicate" do
        rule = SmartGroupRules::RegistrationCompletedAt.new('is_empty')
        expect(rule.filter(User).count).to eq 1 
      end

      it "correctly filters on 'not_is_empty' predicate" do
        rule = SmartGroupRules::RegistrationCompletedAt.new('not_is_empty')
        expect(rule.filter(User).count).to eq User.count - 1
      end

    end
 
  end

end