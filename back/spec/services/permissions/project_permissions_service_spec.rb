# frozen_string_literal: true

require 'rails_helper'

describe Permissions::ProjectPermissionsService do
  let(:service) { described_class.new }

  before do
    SettingsService.new.activate_feature! 'user_confirmation'
  end

  describe '"posting_idea" denied_reason_for_project' do
    it 'returns `posting_disabled` when posting is disabled' do
      project = create(:project_with_current_phase, current_phase_attrs: { posting_enabled: false })
      expect(service.denied_reason_for_project('posting_idea', create(:user), project)).to eq 'posting_disabled'
    end

    it "returns `nil` when we're in an ideation context" do
      project = create(:project_with_current_phase, current_phase_attrs: { participation_method: 'ideation' })
      expect(service.denied_reason_for_project('posting_idea', create(:user), project)).to be_nil
    end

    it "returns `nil` when we're in an native_survey context" do
      project = create(:project_with_current_phase, current_phase_attrs: {
        participation_method: 'native_survey',
        native_survey_title_multiloc: { 'en' => 'Survey', 'nl-BE' => 'Vragenlijst' },
        native_survey_button_multiloc: { 'en' => 'Take the survey', 'nl-BE' => 'De enquete invullen' }
      })
      expect(service.denied_reason_for_project('posting_idea', create(:user), project)).to be_nil
    end

    it "returns `not_ideation` when we're not in an ideation or native_survey context" do
      project = create(:project_with_current_phase, current_phase_attrs: { participation_method: 'information' })
      expect(service.denied_reason_for_project('posting_idea', create(:user), project)).to eq 'not_ideation'
    end

    it "returns `not_ideation` when we're in a voting context" do
      project = create(
        :project_with_current_phase,
        current_phase_attrs: { participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 1200 }
      )
      expect(service.denied_reason_for_project('posting_idea', create(:user), project)).to eq 'not_ideation'
    end

    it 'returns `project_inactive` when the timeline is over' do
      project = create(:project_with_past_phases)
      expect(service.denied_reason_for_project('posting_idea', create(:user), project)).to eq 'project_inactive'
    end

    it "returns 'project_inactive' when the project is archived" do
      project = create(:single_phase_ideation_project, admin_publication_attributes: { publication_status: 'archived' })
      expect(service.denied_reason_for_project('posting_idea', create(:user), project)).to eq 'project_inactive'
    end

    it 'returns `posting_limited_max_reached` if the posting limit was reached' do
      user = create(:user)
      project = create(:single_phase_ideation_project, phase_attrs: { posting_enabled: true, posting_method: 'limited', posting_limited_max: 1 })
      create(:idea, project: project, author: user, phases: project.phases)

      expect(service.denied_reason_for_project('posting_idea', user, project)).to eq 'posting_limited_max_reached'
    end

    it 'returns `posting_limited_max_reached` if the author posted a survey anonymously and the limit was reached' do
      user = create(:user)
      project = create(:single_phase_native_survey_project, phase_attrs: {
        posting_enabled: true, posting_method: 'limited', posting_limited_max: 1, allow_anonymous_participation: true
      })
      create(:native_survey_response, project: project, author: user, anonymous: true, phases: project.phases, creation_phase: project.phases.first)

      expect(service.denied_reason_for_project('posting_idea', user, project)).to eq 'posting_limited_max_reached'
    end

    it 'returns nil if the posting limit was not reached' do
      user = create(:user)
      project = create(:single_phase_ideation_project, phase_attrs: { posting_enabled: true, posting_method: 'limited', posting_limited_max: 1 })
      create(:idea, project: project)

      expect(service.denied_reason_for_project('posting_idea', user, project)).to be_nil
    end

    context 'with phase permissions' do
      let(:project) { create(:project_with_current_phase, current_phase_attrs: { with_permissions: true }) }
      let(:permission) do
        TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'posting_idea')
      end

      it 'returns nil when posting is allowed' do
        user = create(:user)
        group = create(:group)
        group.add_member(user).save!

        permission.update!(permitted_by: 'groups', groups: [group])
        expect(service.denied_reason_for_project('posting_idea', user, project)).to be_nil
      end

      it 'returns `not_signed_in` when user needs to be signed in' do
        permission.update!(permitted_by: 'users')
        expect(service.denied_reason_for_project('posting_idea', nil, project)).to eq 'not_signed_in'
      end

      it 'returns `not_in_group` when posting is not permitted' do
        permission.update!(permitted_by: 'groups', groups: create_list(:group, 2))
        expect(service.denied_reason_for_project('posting_idea', create(:user), project)).to eq 'not_in_group'
      end

      it 'returns nil when everyone can post and the user is not signed in' do
        permission.update! permitted_by: 'everyone'
        expect(service.denied_reason_for_project('posting_idea', nil, project)).to be_nil
      end
    end
  end

  describe '"commenting_idea" denied_reason_for_project' do
    let(:user) { create(:user) }

    it 'returns nil when the commenting is allowed in the current phase' do
      project = create(:project_with_current_phase)
      expect(service.denied_reason_for_project('commenting_idea', user, project)).to be_nil
    end

    it 'returns `commenting_disabled` when commenting is disabled in the current phase' do
      project = create(
        :project_with_current_phase,
        current_phase_attrs: { commenting_enabled: false }
      )
      expect(service.denied_reason_for_project('commenting_idea', user, project)).to eq 'commenting_disabled'
    end

    it "returns 'project_inactive' when the timeline hasn't started" do
      project = create(:project_with_future_phases)
      expect(service.denied_reason_for_project('commenting_idea', user, project)).to eq 'project_inactive'
    end

    it "returns 'project_inactive' when the timeline is over" do
      project = create(:project_with_past_phases)
      expect(service.denied_reason_for_project('commenting_idea', user, project)).to eq 'project_inactive'
    end

    it "returns 'project_inactive' when the project is archived" do
      project = create(:project_with_current_phase, admin_publication_attributes: { publication_status: 'archived' })
      expect(service.denied_reason_for_project('commenting_idea', user, project)).to eq 'project_inactive'
    end

    it "returns nil when we're in a participatory budgeting context" do
      project = create(
        :project_with_current_phase,
        current_phase_attrs: { participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 1200 }
      )
      expect(service.denied_reason_for_project('commenting_idea', user, project)).to be_nil
    end

    context 'with phase permissions' do
      let(:project) { create(:project_with_current_phase, current_phase_attrs: { with_permissions: true }) }
      let(:permission) do
        TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'commenting_idea')
      end

      it 'returns `not_signed_in` when user needs to be signed in' do
        permission.update!(permitted_by: 'users')
        expect(service.denied_reason_for_project('commenting_idea', nil, project)).to eq 'not_signed_in'
      end

      it 'returns `not_in_group` commenting is not permitted for the user' do
        permission.update!(permitted_by: 'groups', groups: create_list(:group, 2))
        expect(service.denied_reason_for_project('commenting_idea', user, project)).to eq 'not_in_group'
      end

      it "returns 'commenting_disabled' when commenting is disabled in the phase" do
        project.phases[2].update!(commenting_enabled: false)
        expect(service.denied_reason_for_project('commenting_idea', user, project)).to eq 'commenting_disabled'
      end
    end
  end

  describe '"reacting_idea" denied_reason_for_project' do
    let(:user) { create(:user) }

    it 'returns nil when reacting is enabled in the current phase' do
      project = create(:project_with_current_phase, current_phase_attrs: { reacting_enabled: true })

      expect(service.denied_reason_for_project('reacting_idea', user, project, reaction_mode: 'up')).to be_nil
      expect(service.denied_reason_for_project('reacting_idea', user, project, reaction_mode: 'down')).to be_nil
    end

    it 'returns `project_inactive` when the project is archived' do
      project = create(
        :project_with_current_phase,
        admin_publication_attributes: { publication_status: 'archived' }, current_phase_attrs: { reacting_enabled: true }
      )

      expect(service.denied_reason_for_project('reacting_idea', user, project, reaction_mode: 'up')).to eq 'project_inactive'
      expect(service.denied_reason_for_project('reacting_idea', user, project, reaction_mode: 'down')).to eq 'project_inactive'
    end

    it "returns `project_inactive` when the timeline hasn't started yet" do
      project = create(:project_with_future_phases)

      expect(service.denied_reason_for_project('reacting_idea', user, project, reaction_mode: 'up')).to eq 'project_inactive'
      expect(service.denied_reason_for_project('reacting_idea', user, project, reaction_mode: 'down')).to eq 'project_inactive'
    end

    it 'returns `project_inactive` when the timeline has past' do
      project = create(:project_with_past_phases)

      expect(service.denied_reason_for_project('reacting_idea', user, project, reaction_mode: 'up')).to eq 'project_inactive'
      expect(service.denied_reason_for_project('reacting_idea', user, project, reaction_mode: 'down')).to eq 'project_inactive'
    end

    it "returns `not_ideation` when we're in a participatory budgeting context" do
      project = create(:project_with_current_phase, current_phase_attrs: { participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 1000 })

      expect(service.denied_reason_for_project('reacting_idea', user, project, reaction_mode: 'up')).to eq 'not_ideation'
      expect(service.denied_reason_for_project('reacting_idea', user, project, reaction_mode: 'down')).to eq 'not_ideation'
    end

    it 'returns `reacting_disabled` if reacting is disabled' do
      project = create(:project_with_current_phase, current_phase_attrs: { reacting_enabled: false })

      expect(service.denied_reason_for_project('reacting_idea', user, project, reaction_mode: 'up')).to eq 'reacting_disabled'
      expect(service.denied_reason_for_project('reacting_idea', user, project, reaction_mode: 'down')).to eq 'reacting_disabled'
    end

    it 'returns `reacting_like_limited_max_reached` if the like limit was reached' do
      project = create(:project_with_current_phase,
        current_phase_attrs: { reacting_enabled: true, reacting_like_method: 'limited', reacting_like_limited_max: 1 })
      create(:reaction, mode: 'up', user: user, reactable: create(:idea, project: project, phases: project.phases))

      expect(service.denied_reason_for_project('reacting_idea', user, project, reaction_mode: 'up')).to eq 'reacting_like_limited_max_reached'
      expect(service.denied_reason_for_project('reacting_idea', user, project, reaction_mode: 'down')).to be_nil
    end

    describe 'with phase permissions' do
      let(:reasons) { Permissions::ProjectPermissionsService::REACTING_DENIED_REASONS }

      let(:project) { create(:project_with_current_phase, current_phase_attrs: { with_permissions: true }) }
      let(:idea) { create(:idea, project: project, phases: [project.phases[2]]) }
      let(:permission) do
        TimelineService.new.current_phase_not_archived(project).permissions
          .find_by(action: 'reacting_idea')
      end

      it 'returns `not_signed_in` when user needs to be signed in' do
        permission.update!(permitted_by: 'users')
        expect(service.denied_reason_for_project('reacting_idea', nil, project, reaction_mode: 'up')).to eq 'not_signed_in'
        expect(service.denied_reason_for_project('reacting_idea', nil, project, reaction_mode: 'down')).to eq 'not_signed_in'
      end

      it "returns 'not_in_group' if it's in the current phase and reacting is not permitted" do
        permission.update!(permitted_by: 'groups', groups: create_list(:group, 2))
        expect(service.denied_reason_for_project('reacting_idea', user, project, reaction_mode: 'up')).to eq 'not_in_group'
        expect(service.denied_reason_for_project('reacting_idea', user, project, reaction_mode: 'down')).to eq 'not_in_group'
      end
    end
  end

  describe '"taking_survey" denied_reason_for_project' do
    it 'returns `not_survey` when the active context is not a survey' do
      project = create(:project_with_current_phase, current_phase_attrs: { participation_method: 'ideation' })
      expect(service.denied_reason_for_project('taking_survey', create(:user), project)).to eq 'not_survey'
    end

    it 'returns `project_inactive` when the timeline has past' do
      project = create(:project_with_past_phases)
      expect(service.denied_reason_for_project('taking_survey', create(:user), project)).to eq 'project_inactive'
    end

    it 'returns `project_inactive` when the project is archived' do
      project = create(:single_phase_ideation_project, admin_publication_attributes: { publication_status: 'archived' })
      expect(service.denied_reason_for_project('taking_survey', create(:user), project)).to eq 'project_inactive'
    end

    it 'returns nil when taking the survey is allowed' do
      project = create(:single_phase_typeform_survey_project, phase_attrs: { with_permissions: true })
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'taking_survey')
      groups = create_list(:group, 2, projects: [project])
      permission.update!(permitted_by: 'groups', group_ids: groups.map(&:id))
      user = create(:user)
      group = groups.first
      group.add_member user
      group.save!
      expect(service.denied_reason_for_project('taking_survey', user, project)).to be_nil
    end

    it 'returns `not_signed_in` when user needs to be signed in' do
      project = create(:single_phase_typeform_survey_project, phase_attrs: { with_permissions: true })
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'taking_survey')
      permission.update!(permitted_by: 'users')
      expect(service.denied_reason_for_project('taking_survey', nil, project)).to eq 'not_signed_in'
    end

    it 'returns `not_in_group` when taking the survey is not permitted' do
      project = create(:single_phase_typeform_survey_project, phase_attrs: { with_permissions: true })
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'taking_survey')
      permission.update!(
        permitted_by: 'groups',
        group_ids: create_list(:group, 2).map(&:id)
      )
      expect(service.denied_reason_for_project('taking_survey', create(:user), project)).to eq 'not_in_group'
    end
  end

  describe '"annotating_document" denied_reason_for_project' do
    it 'returns `not_document_annotation` when the active context is not document_annotation' do
      project = create(:project_with_current_phase, current_phase_attrs: { participation_method: 'ideation' })
      expect(service.denied_reason_for_project('annotating_document', create(:user), project))
        .to eq 'not_document_annotation'
    end

    it 'returns `project_inactive` when the timeline has past' do
      project = create(:project_with_past_phases)
      expect(service.denied_reason_for_project('annotating_document', create(:user), project)).to eq 'project_inactive'
    end

    it 'returns `project_inactive` when the project is archived' do
      project = create(:single_phase_ideation_project, admin_publication_attributes: { publication_status: 'archived' })
      expect(service.denied_reason_for_project('annotating_document', create(:user), project)).to eq 'project_inactive'
    end

    it 'returns nil when annotating the document is allowed' do
      project = create(:single_phase_document_annotation_project, phase_attrs: { with_permissions: true })
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'annotating_document')
      groups = create_list(:group, 2, projects: [project])
      permission.update!(permitted_by: 'groups', group_ids: groups.map(&:id))
      user = create(:user)
      group = groups.first
      group.add_member user
      group.save!
      expect(service.denied_reason_for_project('annotating_document', user, project)).to be_nil
    end

    it 'returns `not_signed_in` when user needs to be signed in' do
      project = create(:single_phase_document_annotation_project, phase_attrs: { with_permissions: true })
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'annotating_document')
      permission.update!(permitted_by: 'users')
      expect(service.denied_reason_for_project('annotating_document', nil, project)).to eq 'not_signed_in'
    end

    it 'returns `not_permitted` when annotating the document is not permitted' do
      project = create(:single_phase_document_annotation_project, phase_attrs: { with_permissions: true })
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'annotating_document')
      permission.update!(permitted_by: 'admins_moderators')
      expect(service.denied_reason_for_project('annotating_document', create(:user), project)).to eq 'not_permitted'
    end
  end

  describe '"taking_poll" denied_reason_for_project' do
    it 'returns `not_poll` when the active context is not a poll' do
      project = create(:project_with_current_phase, current_phase_attrs: { participation_method: 'information' })
      expect(service.denied_reason_for_project('taking_poll', create(:user), project)).to eq 'not_poll'
    end

    it 'returns `already_responded` when the user already responded to the poll before' do
      project = create(:single_phase_poll_project)
      poll_response = create(:poll_response, phase: project.phases.first)
      user = poll_response.user
      expect(service.denied_reason_for_project('taking_poll', user, project)).to eq 'already_responded'
    end

    it 'returns `project_inactive` when the timeline has past' do
      project = create(:project_with_past_phases)
      expect(service.denied_reason_for_project('taking_poll', create(:user), project)).to eq 'project_inactive'
    end

    it 'returns `project_inactive` when the project is archived' do
      project = create(:single_phase_ideation_project, admin_publication_attributes: { publication_status: 'archived' })
      expect(service.denied_reason_for_project('taking_poll', create(:user), project)).to eq 'project_inactive'
    end

    it 'returns nil when taking the poll is allowed' do
      project = create(:single_phase_poll_project, phase_attrs: { with_permissions: true })
      permission = Permission.find_by(action: 'taking_poll', permission_scope: project.phases.first)
      group = create(:group, projects: [project])
      permission.update!(permitted_by: 'groups', groups: [group])
      user = create(:user)
      group.add_member(user)
      group.save!
      expect(service.denied_reason_for_project('taking_poll', user, project)).to be_nil
    end

    it 'returns `not_signed_in` when user needs to be signed in' do
      project = create(:single_phase_poll_project, phase_attrs: { with_permissions: true })
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'taking_poll')
      permission.update!(permitted_by: 'users')
      expect(service.denied_reason_for_project('taking_poll', nil, project)).to eq 'not_signed_in'
    end

    it 'return `not_permitted` when taking the poll is not permitted' do
      project = create(:single_phase_poll_project, phase_attrs: { with_permissions: true })
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'taking_poll')
      permission.update!(permitted_by: 'admins_moderators')
      expect(service.denied_reason_for_project('taking_poll', create(:user), project)).to eq 'not_permitted'
    end
  end

  describe '"voting" denied_reason_for_project' do
    it 'returns `not_signed_in` when user needs to be signed in' do
      project = create(
        :project_with_current_phase,
        current_phase_attrs: { with_permissions: true, participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 10_000 }
      )
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'voting')
      permission.update!(permitted_by: 'users')
      expect(service.denied_reason_for_project('voting', nil, project)).to eq 'not_signed_in'
    end

    it 'returns `not_in_group` when the idea is in the current phase and voting is not permitted' do
      project = create(
        :project_with_current_phase,
        current_phase_attrs: { with_permissions: true, participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 10_000 }
      )
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'voting')
      permission.update!(
        permitted_by: 'groups',
        group_ids: create_list(:group, 2).map(&:id)
      )
      expect(service.denied_reason_for_project('voting', create(:user), project)).to eq 'not_in_group'
    end

    it "returns 'project_inactive' when the timeline is over" do
      project = create(:project_with_past_phases)
      expect(service.denied_reason_for_project('voting', create(:user), project)).to eq 'project_inactive'
    end

    it "returns 'project_inactive' when the project is archived" do
      project = create(:single_phase_budgeting_project, admin_publication_attributes: { publication_status: 'archived' })
      expect(service.denied_reason_for_project('voting', create(:user), project)).to eq 'project_inactive'
    end
  end

  describe '"posting_idea" future_enabled_phase' do
    it 'returns the first upcoming phase that has posting enabled' do
      project = create(
        :project_with_current_phase,
        phases_config: {
          sequence: 'xcxxxxxy',
          x: { posting_enabled: false },
          y: { posting_enabled: true },
          c: { posting_enabled: false }
        }
      )
      expect(service.future_enabled_phase('posting_idea', create(:user), project)).to eq project.phases.order(:start_at)[7]
    end

    it 'returns nil if no next phase has posting enabled' do
      project = create(
        :project_with_current_phase,
        phases_config: {
          sequence: 'xcyyy',
          y: { posting_enabled: false }
        }
      )
      expect(service.future_enabled_phase('posting_idea', create(:user), project)).to be_nil
    end

    it 'returns nil for a project without future phases' do
      project = create(:project_with_past_phases)
      expect(service.future_enabled_phase('posting_idea', create(:user), project)).to be_nil
    end
  end

  describe '"reacting_idea" future_enabled_phase' do
    it 'returns the first upcoming phase that has reacting enabled' do
      project = create(
        :project_with_current_phase,
        phases_config: {
          sequence: 'xcxxy',
          x: { reacting_enabled: true, reacting_dislike_enabled: false },
          c: { reacting_enabled: false },
          y: { reacting_enabled: true, reacting_dislike_enabled: true }
        }
      )
      expect(service.future_enabled_phase('reacting_idea', create(:user), project, reaction_mode: 'up')).to eq project.phases.order(:start_at)[2]
      expect(service.future_enabled_phase('reacting_idea', create(:user), project, reaction_mode: 'down')).to eq project.phases.order(:start_at)[4]
    end

    it 'returns nil if no next phase has reacting enabled' do
      project = create(
        :project_with_current_phase,
        phases_config: {
          sequence: 'xcyy',
          y: { reacting_enabled: false }
        }
      )
      expect(service.future_enabled_phase('reacting_idea', create(:user), project, reaction_mode: 'up')).to be_nil
      expect(service.future_enabled_phase('reacting_idea', create(:user), project, reaction_mode: 'down')).to be_nil
    end

    it 'returns nil for a project without future phases' do
      project = create(:project_with_past_phases)
      expect(service.future_enabled_phase('reacting_idea', create(:user), project, reaction_mode: 'up')).to be_nil
      expect(service.future_enabled_phase('reacting_idea', create(:user), project, reaction_mode: 'down')).to be_nil
    end
  end

  describe '"commenting_idea" future_enabled_phase' do
    it 'returns the first upcoming phase that has commenting enabled' do
      project = create(
        :project_with_current_phase,
        phases_config: {
          sequence: 'xcxxxxxy',
          x: { commenting_enabled: false },
          y: { commenting_enabled: true },
          c: { commenting_enabled: false }
        }
      )
      expect(service.future_enabled_phase('commenting_idea', create(:user), project)).to eq project.phases.order(:start_at)[7]
    end

    it 'returns nil if no next phase has commenting enabled' do
      project = create(
        :project_with_current_phase,
        phases_config: {
          sequence: 'xcyyy',
          y: { commenting_enabled: false }
        }
      )
      expect(service.future_enabled_phase('commenting_idea', create(:user), project)).to be_nil
    end

    it 'returns nil for a project without future phases' do
      project = create(:project_with_past_phases)
      expect(service.future_enabled_phase('commenting_idea', create(:user), project)).to be_nil
    end
  end

  describe '"voting" future_enabled_phase' do
    it 'returns the first upcoming phase that is voting' do
      project = create(
        :project_with_current_phase,
        phases_config: {
          sequence: 'xcxxyxy',
          x: { participation_method: 'ideation' },
          y: { participation_method: 'voting', voting_method: 'budgeting' },
          c: { participation_method: 'ideation' }
        }
      )
      expect(service.future_enabled_phase('voting', create(:user), project)).to eq project.phases.order(:start_at)[4]
    end

    it 'returns nil if none of the next phases are voting phase' do
      project = create(
        :project_with_current_phase,
        phases_config: {
          sequence: 'xcyyy',
          y: { participation_method: 'ideation' }
        }
      )
      expect(service.future_enabled_phase('voting', create(:user), project)).to be_nil
    end

    it 'returns nil for a project without future phases' do
      project = create(:project_with_past_phases)
      expect(service.future_enabled_phase('voting', create(:user), project)).to be_nil
    end
  end
end
