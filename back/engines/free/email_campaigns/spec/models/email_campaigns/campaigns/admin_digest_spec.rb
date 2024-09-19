# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::AdminDigest do
  describe 'AdminDigest Campaign default factory' do
    it { expect(build(:admin_digest_campaign)).to be_valid }
  end

  describe '#generate_commands' do
    let(:campaign) { create(:admin_digest_campaign) }
    let!(:admin) { create(:admin) }
    let!(:old_ideas) { create_list(:idea, 2, published_at: 20.days.ago) }
    let!(:new_ideas) { create_list(:idea, 2, published_at: 1.day.ago) }
    let!(:new_proposal) { create(:proposal, published_at: 1.day.ago) }
    let!(:reaction) { create(:reaction, mode: 'up', reactable: new_ideas.first) }
    let!(:draft) { create(:idea, publication_status: 'draft') }

    it 'generates a command with the desired payload and tracked content' do
      command = campaign.generate_commands(recipient: admin).first

      expect(
        command.dig(:event_payload, :statistics, :new_inputs_increase)
      ).to eq(3)
      expect(
        command.dig(:event_payload, :statistics, :new_comments_increase)
      ).to eq(0)
      expect(
        command.dig(:event_payload, :top_project_inputs).flat_map { |tpi| tpi[:top_ideas].pluck(:id) }
      ).to include(new_ideas.first.id)
      expect(
        command.dig(:event_payload, :top_project_inputs).flat_map { |tpi| tpi[:top_ideas].pluck(:id) }
      ).not_to include(draft.id)
      expect(
        command.dig(:event_payload, :top_project_inputs).flat_map { |tpi| tpi[:top_ideas].pluck(:id) }
      ).to include(new_proposal.id)
      expect(command.dig(:tracked_content, :idea_ids)).to include(new_ideas.first.id, new_proposal.id)
    end

    it 'does not include native survey responses' do
      create(:idea_status_proposed)
      project = create(:single_phase_native_survey_project)
      response = create(:idea, project: project, creation_phase: project.phases.first)

      command = campaign.generate_commands(recipient: admin).first
      expect(
        command.dig(:event_payload, :top_project_inputs).flat_map { |tpi| tpi[:top_ideas].pluck(:id) }
      ).not_to include response.id
    end
  end

  describe 'apply_recipient_filters' do
    let(:campaign) { build(:admin_digest_campaign) }

    it 'filters out invitees' do
      admin = create(:admin)
      create(:invited_user, roles: [{ type: 'admin' }])

      expect(campaign.apply_recipient_filters).to match([admin])
    end

    it 'filters out normal users' do
      admin = create(:admin)
      create(:user)

      expect(campaign.apply_recipient_filters).to match([admin])
    end

    it 'filters out moderators' do
      admin = create(:admin)
      create(:project_moderator)

      expect(campaign.apply_recipient_filters).to match([admin])
    end
  end

  describe 'content_worth_sending?' do
    let(:campaign) { build(:admin_digest_campaign) }
    let(:project) { create(:single_phase_ideation_project) }

    it 'returns false when no significant stats' do
      expect(campaign.send(:content_worth_sending?, {})).to be false
    end

    it 'returns true when significant stats' do
      create(:idea, project: project)

      expect(campaign.send(:content_worth_sending?, {})).to be true
    end
  end
end
