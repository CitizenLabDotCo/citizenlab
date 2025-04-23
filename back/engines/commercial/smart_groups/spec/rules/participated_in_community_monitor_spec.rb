# frozen_string_literal: true

require 'rails_helper'

describe SmartGroups::Rules::ParticipatedInCommunityMonitor do
  let(:valid_json_rule) do
    {
      'ruleType' => 'participated_in_community_monitor',
      'predicate' => 'taken_survey'
    }
  end
  let(:valid_rule) { described_class.from_json(valid_json_rule) }

  describe 'from_json' do
    it 'successfully parses a valid json' do
      expect(valid_rule.predicate).to eq valid_json_rule['predicate']
    end
  end

  describe 'validations' do
    it 'successfully validate the valid rule' do
      expect(valid_rule).to be_valid
    end
  end

  describe 'filter' do
    let!(:project) { create(:community_monitor_project) }
    let!(:users) { create_list(:user, 3) }
    let!(:survey_response) do
      create(:idea_status_proposed)
      create(:native_survey_response, author: users[0], project: project, creation_phase: project.phases.first)
    end

    it "correctly filters on 'taken_survey' predicate" do
      rule = described_class.new('taken_survey')
      expect(rule.filter(User).count).to eq 1
      expect(rule.filter(User).pluck(:id)).to eq [users[0].id]
    end

    it "correctly filters on 'not_take_survey' predicate" do
      rule = described_class.new('not_taken_survey')
      expect(rule.filter(User).count).to eq 2
      expect(rule.filter(User).pluck(:id)).to match_array [users[1].id, users[2].id]
    end
  end
end
