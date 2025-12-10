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
    let!(:top_comment) { create(:comment, idea: top_idea, created_at: Time.now - 3.minutes) }
    let!(:comments) { create_list(:comment, 3, idea: top_idea, parent: top_comment) + create_list(:comment, 5, idea: top_idea) + [top_comment] }
    let!(:draft_project) { create(:project, admin_publication_attributes: { publication_status: 'draft' }, created_at: Time.now - 2.minutes) }
    let!(:threshold_reached_status) { create(:proposals_status, code: 'threshold_reached') }
    let!(:proposal) { create(:proposal, idea_status: threshold_reached_status, published_at: 1.year.ago) }
    let!(:proposal_changed_activity) { create(:idea_changed_status_activity, item: proposal, payload: { change: [nil, threshold_reached_status.id] }, acted_at: 1.day.ago) }

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
      expect(
        command.dig(:event_payload, :successful_proposals, 0)
      ).to include(
        id: proposal.id,
        published_at: proposal.published_at.iso8601
      )
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
    end

    it 'does not include native survey responses' do
      create(:idea_status_proposed)
      project = create(:single_phase_native_survey_project)
      response = create(:idea, project: project, creation_phase: project.phases.first)

      command = campaign.generate_commands(recipient: user).first
      expect(command.dig(:tracked_content, :idea_ids)).not_to include response.id
    end

    it 'does not include ideas from unlisted projects' do
      unlisted_project = create(:project, listed: false)
      unlisted_idea = create(:idea, project: unlisted_project, published_at: Time.now - 1.hour)

      command = campaign.generate_commands(recipient: user).first
      expect(command.dig(:tracked_content, :idea_ids)).not_to include unlisted_idea.id
    end
  end

  describe 'filter_hooks' do
    let(:campaign) { build(:user_digest_campaign) }

    let_it_be(:activity) { create(:activity) }

    it 'returns true when there are at least 3 ideas updated in the last week' do
      create_list(:idea, 3, published_at: Time.now - 1.minute)
      expect(campaign.content_worth_sending?(time: Time.now, activity:)).to be true
    end

    it 'returns false when there are less than 3 ideas updated in the last week' do
      create_list(:idea, 2, published_at: Time.now - 1.minute)
      expect(campaign.content_worth_sending?(time: Time.now, activity:)).to be false
    end

    it 'returns true when there 3 ideas with comments or reactions updated in the last week' do
      old_ideas = create_list(:idea, 3, published_at: Time.now - 30.days, updated_at: Time.now - 30.days)
      create(:comment, idea: old_ideas.first, created_at: Time.now - 1.minute)
      create(:comment, idea: old_ideas.second, created_at: Time.now - 1.minute)
      create(:reaction, reactable: old_ideas.last, created_at: Time.now - 1.minute)
      expect(campaign.content_worth_sending?(time: Time.now, activity:)).to be true
    end

    it 'returns true when there are proposals that reached the threshold' do
      threshold_reached_status = create(:proposals_status, code: 'threshold_reached')
      proposal = create(:proposal, idea_status: threshold_reached_status)
      create(:idea_changed_status_activity, item: proposal, payload: { change: [nil, threshold_reached_status.id] }, acted_at: 1.day.ago)
      expect(campaign.content_worth_sending?(time: Time.now, activity:)).to be true
    end
  end

  describe 'apply_recipient_filters' do
    let(:campaign) { build(:user_digest_campaign) }

    it 'filters out invitees' do
      user = create(:user)
      invitee = create(:invited_user)

      expect(campaign.apply_recipient_filters.map(&:id)).to contain_exactly(user.id, invitee.invitee_invite.inviter.id)
    end
  end
end
