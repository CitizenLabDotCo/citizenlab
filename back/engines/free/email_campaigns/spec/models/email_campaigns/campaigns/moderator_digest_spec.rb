# frozen_string_literal: true

require 'rails_helper'

skip_reason = defined?(EmailCampaigns::Engine) ? nil : 'email_campaigns engine is not installed'

RSpec.describe 'EmailCampaigns::Campaigns::ModeratorDigest', skip: skip_reason do
  describe 'ModeratorDigest Campaign default factory' do
    it 'is valid' do
      expect(build(:moderator_digest_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:moderator_digest_campaign) }
    let!(:project) do
      create(
        :project_with_current_phase,
        phases_config: {
          sequence: 'xc',
          x: {}
        },
        current_phase_attrs: {
          participation_method: 'proposals'
        }
      )
    end
    let!(:moderator) { create(:project_moderator, projects: [project]) }
    let!(:old_ideas) { create_list(:idea, 2, project: project, published_at: 20.days.ago) }
    let!(:top_new_idea) { create(:idea, project: project, published_at: 1.day.ago) }
    let!(:other_new_ideas) { create_list(:idea, 3, project: project, published_at: 1.day.ago) }
    let!(:reaction) { create(:reaction, mode: 'up', reactable: top_new_idea) }
    let!(:comment) { create(:comment, idea: old_ideas[0]) }
    let!(:other_idea) { create(:idea, project: create(:project)) }
    let!(:draft) { create(:idea, project: project, publication_status: 'draft') }
    let!(:threshold_reached_status) { create(:proposals_status, code: 'threshold_reached') }
    let!(:proposal) { create(:proposal, project:, idea_status: threshold_reached_status, phases: [project.phases.last], creation_phase: project.phases.last) }
    let!(:proposal_changed_activity) { create(:idea_changed_status_activity, item: proposal, payload: { change: [nil, threshold_reached_status.id] }, acted_at: 1.day.ago) }

    it 'generates a command with the desired payload and tracked content' do
      command = campaign.generate_commands(recipient: moderator).first

      expect(
        command.dig(:event_payload, :statistics, :new_ideas_increase)
      ).to eq(other_new_ideas.size + 2)
      expect(
        command.dig(:event_payload, :statistics, :new_comments_increase)
      ).to eq(1)
      expect(
        command.dig(:event_payload, :top_ideas).pluck(:id)
      ).to include(top_new_idea.id)
      expect(
        command.dig(:event_payload, :top_ideas).pluck(:id)
      ).not_to include(draft.id)
      expect(
        command.dig(:event_payload, :top_ideas).pluck(:id)
      ).not_to include(other_idea.id)
      expect(
        command.dig(:event_payload, :successful_proposals).pluck(:id)
      ).to include(proposal.id)
      expect(command.dig(:tracked_content, :idea_ids)).to include(top_new_idea.id, proposal.id)
    end

    it 'generates a command with abbreviated names' do
      SettingsService.new.activate_feature! 'abbreviated_user_names'

      expect(moderator.admin?).to be false

      command = campaign.generate_commands(recipient: moderator).first
      payload_first_top_idea = command.dig(:event_payload, :top_ideas, 0)
      first_top_idea = Idea.find_by(id: payload_first_top_idea.fetch(:id))
      expected_author_name = "#{first_top_idea.author.first_name} #{first_top_idea.author.last_name[0]}."

      expect(payload_first_top_idea[:author_name]).to eq(expected_author_name)
    end

    # added to reproduce the bug and test the fix
    it 'gracefully handles absent projects' do
      Project.find(moderator.roles[0]['project_id']).destroy!
      commands = campaign.reload.generate_commands(recipient: moderator.reload).first
      expect(commands).to be_blank
    end

    it 'does not include native survey responses' do
      create(:idea_status_proposed)
      survey_project = create(:single_phase_native_survey_project)
      response = create(:idea, project: survey_project, creation_phase: survey_project.phases.first)
      moderator.add_role 'project_moderator', project_id: survey_project.id
      moderator.save!

      commands = campaign.generate_commands(recipient: moderator)
      expect(
        commands.flat_map { |command| command.dig(:event_payload, :top_ideas).pluck(:id) }
      ).not_to include response.id
    end

    it 'does not generate a command for archived projects' do
      project.admin_publication.update! publication_status: 'archived'
      commands = campaign.generate_commands(recipient: moderator).first
      expect(commands).to be_blank
    end
  end

  describe 'apply_recipient_filters' do
    let(:campaign) { build(:moderator_digest_campaign) }

    it 'filters out invitees' do
      moderator = create(:project_moderator)
      create(:invited_user, roles: [{ type: 'project_moderator', project_id: create(:project).id }])

      expect(campaign.apply_recipient_filters).to match([moderator])
    end

    it 'filters out admins and normal users' do
      create(:admin)
      moderator = create(:project_moderator)
      create(:user)

      expect(campaign.apply_recipient_filters).to match([moderator])
    end
  end

  describe 'zero_statistics?' do
    let(:campaign) { build(:moderator_digest_campaign) }
    let(:project) { create(:project) }

    it 'returns true when no significant stats' do
      stats = { new_ideas_increase: 0,
                new_comments_increase: 0,
                new_participants_increase: 0 }

      expect(campaign.send(:zero_statistics?, stats)).to be true
    end

    it 'returns false when significant stats' do
      stats = { new_ideas_increase: 1,
                new_comments_increase: 0,
                new_participants_increase: 0 }

      expect(campaign.send(:zero_statistics?, stats)).to be false
    end
  end
end
