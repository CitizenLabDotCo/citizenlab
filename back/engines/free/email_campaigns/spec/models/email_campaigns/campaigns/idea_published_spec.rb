# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::IdeaPublished do
  describe 'IdeaPublished Campaign default factory' do
    it 'is valid' do
      expect(build(:idea_published_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:idea_published_campaign) }
    let(:user) { create(:user) }
    let(:idea) { create(:idea, author: user) }
    let(:activity) { create(:activity, item: idea, action: 'published', user: user) }

    it 'generates a command with the desired payload and tracked content' do
      command = campaign.generate_commands(recipient: user, activity: activity).first

      expect(command[:event_payload]).to include(
        idea_id: idea.id,
        input_term: 'idea'
      )
    end

    describe do
      before { create(:idea_status_proposed) }

      let(:idea) do
        project = create(:single_phase_native_survey_project)
        create(:idea, author: user, project: project, creation_phase: project.phases.first)
      end

      it "doesn't get triggered for a native survey response" do
        commands = campaign.generate_commands recipient: user, activity: activity

        expect(commands).to be_empty
      end
    end
  end
end
