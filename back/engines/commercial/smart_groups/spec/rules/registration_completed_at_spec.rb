# frozen_string_literal: true

require 'rails_helper'

describe SmartGroups::Rules::RegistrationCompletedAt do
  describe 'validations' do
    let(:valid_json_rule) do
      {
        'ruleType' => 'registration_completed_at',
        'predicate' => 'is_before',
        'value' => (Date.today - 1.day)
      }
    end
    let(:valid_rule) { described_class.from_json(valid_json_rule) }

    it 'successfully validate the valid rule' do
      expect(valid_rule).to be_valid
      expect(build(:smart_group, rules: [valid_json_rule])).to be_valid
    end
  end

  describe 'filter' do
    context 'on registration completion date' do
      let!(:users) do
        users = create_list(:user, 5)
        users[0].registration_completed_at = Time.now
        users[1].registration_completed_at = (Time.now - 25.hours)
        users[2].registration_completed_at = (Time.now + 25.hours)
        users[3].registration_completed_at = (Time.now - 1.year)
        users[4].registration_completed_at = nil
        users.each(&:save!)
      end

      it "correctly filters on 'is_before' predicate" do
        rule = described_class.new('is_before', Date.today)
        expect(rule.filter(User).count).to eq 2
      end

      it "correctly filters on 'is_after' predicate" do
        rule = described_class.new('is_after', Date.today)
        expect(rule.filter(User).count).to eq 1
      end

      it "correctly filters on 'is_exactly' predicate" do
        rule = described_class.new('is_exactly', Date.today)
        expect(rule.filter(User).count).to eq 1
      end

      it "correctly filters on 'is_empty' predicate" do
        rule = described_class.new('is_empty')
        expect(rule.filter(User).count).to eq 1
      end

      it "correctly filters on 'not_is_empty' predicate" do
        rule = described_class.new('not_is_empty')
        expect(rule.filter(User).count).to eq User.count - 1
      end
    end
  end

  describe 'description_multiloc' do
    let(:registration_completed_at_is_before_rule) do
      described_class.from_json({
        'ruleType' => 'registration_completed_at',
        'predicate' => 'is_before',
        'value' => '2019-11-12'
      })
    end
    let(:registration_completed_at_is_after_rule) do
      described_class.from_json({
        'ruleType' => 'registration_completed_at',
        'predicate' => 'is_after',
        'value' => '2019-11-12'
      })
    end
    let(:registration_completed_at_is_exactly_rule) do
      described_class.from_json({
        'ruleType' => 'registration_completed_at',
        'predicate' => 'is_exactly',
        'value' => '2019-11-12'
      })
    end
    let(:registration_completed_at_is_empty_rule) do
      described_class.from_json({
        'ruleType' => 'registration_completed_at',
        'predicate' => 'is_empty'
      })
    end
    let(:registration_completed_at_not_is_empty_rule) do
      described_class.from_json({
        'ruleType' => 'registration_completed_at',
        'predicate' => 'not_is_empty'
      })
    end

    it 'successfully translates different combinations of rules' do
      expect(registration_completed_at_is_before_rule.description_multiloc).to eq({
        'en' => 'registration is before 2019-11-12',
        'fr-FR' => 'date d\'inscription est avant 12/11/2019',
        'nl-NL' => 'registratie is voor 12-11-2019'
      })
      expect(registration_completed_at_is_after_rule.description_multiloc).to eq({
        'en' => 'registration is after 2019-11-12',
        'fr-FR' => 'date d\'inscription est après 12/11/2019',
        'nl-NL' => 'registratie is na 12-11-2019'
      })
      expect(registration_completed_at_is_exactly_rule.description_multiloc).to eq({
        'en' => 'registration is 2019-11-12',
        'fr-FR' => 'date d\'inscription est 12/11/2019',
        'nl-NL' => 'registratie is 12-11-2019'
      })
      expect(registration_completed_at_is_empty_rule.description_multiloc).to eq({
        'en' => 'registration has no value',
        'fr-FR' => 'date d\'inscription n\'as pas de value',
        'nl-NL' => 'registratie heeft geen waarde'
      })
      expect(registration_completed_at_not_is_empty_rule.description_multiloc).to eq({
        'en' => 'registration has any value',
        'fr-FR' => 'date d\'inscription peut avoir n\'importe quel value',
        'nl-NL' => 'registratie heeft om het even welke waarde'
      })
    end
  end
end
