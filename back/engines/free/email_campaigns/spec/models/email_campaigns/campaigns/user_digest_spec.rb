# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::UserDigest do
  describe 'UserDigest Campaign default factory' do
    it 'is valid' do
      expect(build(:user_digest_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:user_digest_campaign) }
    let!(:user) { create(:user) }
    let!(:new_project) { create(:project, created_at: Time.now - 1.day) }
    let!(:projects) { create_list(:project, 2, created_at: Time.now - 5.days) + [new_project] }
    let!(:top_idea) { create(:idea, project: new_project, published_at: Time.now - 1.hour) }
    let!(:ideas) { create_list(:idea, 10, project: new_project, published_at: Time.now - 2.hours) }
    let!(:reactions) { create_list(:reaction, 3, mode: 'up', reactable: top_idea) + [top_idea] }
    let!(:top_comment) { create(:comment, post: top_idea, created_at: Time.now - 3.minutes) }
    let!(:comments) { create_list(:comment, 3, post: top_idea, parent: top_comment) + create_list(:comment, 5, post: top_idea) + [top_comment] }
    let!(:draft_project) { create(:project, admin_publication_attributes: { publication_status: 'draft' }, created_at: Time.now - 2.minutes) }

    it 'generates a command with the desired payload and tracked content' do
      command = campaign.generate_commands(recipient: user).first

      expect(
        command.dig(:event_payload, :discover_projects).pluck(:created_at)
      ).to include(new_project.created_at.iso8601)
      expect(
        command.dig(:event_payload, :discover_projects).pluck(:created_at)
      ).not_to include(draft_project.created_at.iso8601)
      expect(
        command.dig(:event_payload, :top_ideas).first[:published_at]
      ).to eq(top_idea.published_at.iso8601)
      expect(
        command.dig(:event_payload, :top_ideas).first[:top_comments].first[:created_at]
      ).to eq(top_comment.created_at.iso8601)
    end

    it 'generates a command with abbreviated names' do
      SettingsService.new.activate_feature! 'abbreviated_user_names'

      expect(user.admin?).to be false
      command = campaign.generate_commands(recipient: user).first

      expected_author_name = "#{top_idea.author.first_name} #{top_idea.author.last_name[0]}."
      expect(
        command.dig(:event_payload, :top_ideas, 0, :author_name)
      ).to eq(expected_author_name)

      expect(
        command.dig(:event_payload, :top_ideas, 0, :top_comments, 0, :author_last_name)
      ).to eq("#{top_comment.author.last_name[0]}.")

      # @todo No new initiatives and successful initiatives in this digest
    end

    it 'does not include native survey responses' do
      IdeaStatus.create_defaults
      response = create(:idea, project: create(:continuous_native_survey_project))

      command = campaign.generate_commands(recipient: user).first
      expect(command.dig(:tracked_content, :idea_ids)).not_to include response.id
    end

    it "only includes 'new' initiatives" do
      create(:initiative_status_proposed)

      old_initiative = create(:initiative, build_status_change: false)
      old_initiative.initiative_status_changes.first.update!(created_at: 8.days.ago) # more than 1 week ago

      new_initiative = create(:initiative, build_status_change: false)
      new_initiative.initiative_status_changes.first.update!(created_at: 6.days.ago) # less than 1 week ago

      command = campaign.generate_commands(recipient: user).first

      expect(command.dig(:event_payload, :new_initiatives).pluck(:id)).to match_array [new_initiative.id]
    end
  end

  describe 'before_send_hooks' do
    let(:campaign) { build(:user_digest_campaign) }

    it 'returns true when there are at least 3 trending ideas' do
      create_list(:idea, 3, published_at: Time.now - 1.minute)
      expect(campaign.content_worth_sending?({})).to be true
    end

    it 'returns false when there are less than 3 trending ideas' do
      create_list(:idea, 2, published_at: Time.now - 1.minute)
      expect(campaign.content_worth_sending?({})).to be false
    end
  end

  describe 'apply_recipient_filters' do
    let(:campaign) { build(:user_digest_campaign) }

    it 'filters out invitees' do
      user = create(:user)
      invitee = create(:invited_user)

      expect(campaign.apply_recipient_filters.map(&:id)).to match_array([user.id, invitee.invitee_invite.inviter.id])
    end
  end
end
