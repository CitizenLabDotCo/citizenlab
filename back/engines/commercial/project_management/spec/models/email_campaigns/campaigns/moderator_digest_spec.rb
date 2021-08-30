# frozen_string_literal: true

require 'rails_helper'

skip_reason = defined?(EmailCampaigns::Engine) ? nil : 'email_campaigns engine is not installed'

RSpec.describe 'EmailCampaigns::Campaigns::ModeratorDigest', type: :model, skip: skip_reason do
  describe 'ModeratorDigest Campaign default factory' do
    it 'is valid' do
      expect(build(:moderator_digest_campaign)).to be_valid
    end
  end

  describe '#generate_command' do
    let(:campaign) { create(:moderator_digest_campaign) }
    let!(:project) { create(:project) }
    let!(:moderator) { create(:project_moderator, projects: [project]) }
    let!(:old_ideas) { create_list(:idea, 2, project: project, published_at: Time.zone.now - 20.days) }
    let!(:new_ideas) { create_list(:idea, 3, project: project, published_at: Time.zone.now - 1.day) }
    let!(:vote) { create(:vote, mode: 'up', votable: new_ideas.first) }
    let!(:other_idea) { create(:idea, project: create(:project)) }
    let!(:draft) { create(:idea, project: project, publication_status: 'draft') }

    it 'generates a command with the desired payload and tracked content' do
      command = campaign.generate_commands(recipient: moderator).first

      expect(
        command.dig(:event_payload, :statistics, :activities, :new_ideas, :increase)
      ).to eq(new_ideas.size)
      expect(
        command.dig(:event_payload, :statistics, :activities, :new_votes, :increase)
      ).to eq(1)
      expect(
        command.dig(:event_payload, :top_ideas).pluck(:id)
      ).to include(new_ideas.first.id)
      expect(
        command.dig(:event_payload, :top_ideas).pluck(:id)
      ).not_to include(draft.id)
      expect(
        command.dig(:event_payload, :top_ideas).pluck(:id)
      ).not_to include(other_idea.id)
      expect(command.dig(:tracked_content, :idea_ids)).to include(new_ideas.first.id)
    end

    it 'generates a command with abbreviated names' do
      SettingsService.new.activate_feature! 'abbreviated_user_names'
      
      expect(moderator.admin?).to be false
      command = campaign.generate_commands(recipient: moderator).first

      expected_author_name = "#{new_ideas.first.author.first_name} #{new_ideas.first.author.last_name[0]}."
      expect(
        command.dig(:event_payload, :top_ideas, 0, :author_name)
      ).to eq(expected_author_name)
    end
  end

  describe 'apply_recipient_filters' do
    let(:campaign) { build(:moderator_digest_campaign) }

    it 'filters out invitees' do
      moderator = create(:project_moderator)
      invitee = create(:invited_user, roles: [{ type: 'project_moderator', project_id: create(:project).id }])

      expect(campaign.apply_recipient_filters).to match([moderator])
    end

    it 'filters out moderators and normal users' do
      admin = create(:admin)
      moderator = create(:project_moderator)
      user = create(:user)

      expect(campaign.apply_recipient_filters).to match([moderator])
    end
  end
end
