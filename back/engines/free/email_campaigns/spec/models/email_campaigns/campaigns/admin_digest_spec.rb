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
    let!(:new_ideas) { create_list(:idea, 3, published_at: 1.day.ago) }
    let!(:reaction) { create(:reaction, mode: 'up', reactable: new_ideas.first) }
    let!(:draft) { create(:idea, publication_status: 'draft') }

    it 'generates a command with the desired payload and tracked content' do
      command = campaign.generate_commands(recipient: admin).first

      expect(
        command.dig(:event_payload, :statistics, :new_ideas_increase)
      ).to eq(new_ideas.size)
      expect(
        command.dig(:event_payload, :statistics, :new_comments_increase)
      ).to eq(0)
      expect(
        command.dig(:event_payload, :top_project_ideas).flat_map { |tpi| tpi[:top_ideas].pluck(:id) }
      ).to include(new_ideas.first.id)
      expect(
        command.dig(:event_payload, :top_project_ideas).flat_map { |tpi| tpi[:top_ideas].pluck(:id) }
      ).not_to include(draft.id)
      expect(command.dig(:tracked_content, :idea_ids)).to include(new_ideas.first.id)
    end

    it 'does not include native survey responses' do
      IdeaStatus.create_defaults
      response = create(:idea, project: create(:continuous_native_survey_project))

      command = campaign.generate_commands(recipient: admin).first
      expect(
        command.dig(:event_payload, :top_project_ideas).flat_map { |tpi| tpi[:top_ideas].pluck(:id) }
      ).not_to include response.id
    end

    it "only includes 'new' initiatives" do
      create(:initiative_status_proposed)

      old_initiative = create(:initiative, build_status_change: false)
      old_initiative.initiative_status_changes.first.update!(created_at: 8.days.ago) # more than 1 week ago

      new_initiative = create(:initiative, build_status_change: false)
      new_initiative.initiative_status_changes.first.update!(created_at: 6.days.ago) # less than 1 week ago

      command = campaign.generate_commands(recipient: admin).first

      expect(command.dig(:event_payload, :new_initiatives).pluck(:id)).to match_array [new_initiative.id]
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
    let(:project) { create(:continuous_project, participation_method: 'ideation') }

    it 'returns false when no significant stats' do
      expect(campaign.send(:content_worth_sending?, {})).to be false
    end

    it 'returns true when significant stats' do
      create(:idea, project: project)

      expect(campaign.send(:content_worth_sending?, {})).to be true
    end
  end
end
