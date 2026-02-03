require 'rails_helper'

describe Permissions::IdeaPermissionsService do
  let(:service) { described_class.new(input, user) }
  let(:project) { create(:project_with_current_phase, current_phase_attrs: current_phase_attrs) }
  let(:current_phase_attrs) { {} }
  let(:input) { create(:idea, project: project, phases: [project.phases[2]]) }
  let(:user) { create(:user) }
  let(:reason) { service.denied_reason_for_action(action) }

  before { SettingsService.new.activate_feature! 'user_confirmation' }

  describe '"commenting_idea" denied_reason_for_action' do
    let(:action) { 'commenting_idea' }

    it 'returns nil when the commenting is allowed in the current phase' do
      expect(reason).to be_nil
    end

    context 'when commenting is disabled' do
      let(:current_phase_attrs) { { commenting_enabled: false } }

      it 'returns `commenting_disabled`' do
        expect(reason).to eq 'commenting_disabled'
      end
    end

    context "when the timeline hasn't started" do
      let(:project) { create(:project_with_future_phases) }

      it "returns 'project_inactive'" do
        expect(reason).to eq 'project_inactive'
      end
    end

    context 'when the timeline is over' do
      let(:project) { create(:project_with_past_phases) }

      it "returns 'project_inactive'" do
        expect(reason).to eq 'project_inactive'
      end
    end

    context 'when the project is archived' do
      let(:project) { create(:project_with_current_phase, admin_publication_attributes: { publication_status: 'archived' }) }

      it "returns 'project_inactive'" do
        expect(reason).to eq 'project_inactive'
      end
    end

    context "when we're in a participatory budgeting context" do
      let(:current_phase_attrs) { { participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 1200 } }

      it 'returns nil' do
        expect(reason).to be_nil
      end
    end

    context 'when the idea is not in the current phase' do
      let(:project) { create(:project_with_current_phase) }
      let(:input) { create(:idea, project: project, phases: [project.phases[1]]) }

      it "returns 'idea_not_in_current_phase'" do
        expect(reason).to eq 'idea_not_in_current_phase'
      end
    end

    context 'with phase permissions' do
      let(:current_phase_attrs) { { with_permissions: true } }
      let(:permission) do
        TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'commenting_idea')
      end

      context 'when the user is not signed in' do
        let(:user) { nil }

        it 'returns `user_not_signed_in`' do
          permission.update!(permitted_by: 'users')
          expect(reason).to eq 'user_not_signed_in'
        end
      end

      it 'returns `user_not_in_group` commenting is not permitted for the user' do
        permission.update!(permitted_by: 'users', groups: create_list(:group, 2))
        expect(reason).to eq 'user_not_in_group'
      end

      it "returns 'commenting_disabled' when commenting is disabled in the phase" do
        project.phases[2].update!(commenting_enabled: false)
        expect(reason).to eq 'commenting_disabled'
      end
    end

    context 'on a proposal' do
      let(:project) { phase.project }
      let(:input) { create(:proposal, project: project, creation_phase: phase) }

      context 'when the timeline is over' do
        let(:phase) { create(:proposals_phase, start_at: 10.days.ago, end_at: 5.days.ago) }

        it "returns 'project_inactive'" do
          expect(reason).to eq 'project_inactive'
        end
      end
    end

    context 'when permitted group requires verification' do
      let(:current_phase_attrs) { { with_permissions: true } }

      it 'returns `user_not_verified` when not permitted' do
        permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'commenting_idea')
        verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
        permission.update!(permitted_by: 'users', group_ids: [create(:group).id, verified_members.id])
        expect(service.denied_reason_for_action('commenting_idea')).to eq 'user_not_verified'
      end
    end
  end

  describe '"reacting_idea" denied_reason_for_action' do
    let(:action) { 'reacting_idea' }
    let(:user) { input.author }

    it 'returns nil when reacting is enabled in the current phase' do
      expect(reason).to be_nil
    end

    context "when idea has 'proposed' status" do
      let(:proposed_status) { create(:idea_status, code: 'proposed') }
      let(:input) { create(:idea, project: project, phases: [project.phases[2]], idea_status: proposed_status) }

      it "does not return 'not_reactable_status_code'" do
        expect(reason).to be_nil
      end
    end

    context "when idea has 'prescreening' status" do
      let(:prescreening_status) { create(:idea_status, code: 'prescreening') }
      let(:input) { create(:idea, project: project, phases: [project.phases[2]], publication_status: 'submitted', idea_status: prescreening_status) }

      it "returns 'not_reactable_status_code'" do
        expect(reason).to eq 'not_reactable_status_code'
      end
    end

    context "when idea has 'ineligible' status" do
      let(:ineligible_status) { create(:idea_status, code: 'ineligible') }
      let(:input) { create(:idea, project: project, phases: [project.phases[2]], idea_status: ineligible_status) }

      it "returns 'not_reactable_status_code'" do
        expect(reason).to eq 'not_reactable_status_code'
      end
    end

    context "when idea has 'expired' status" do
      let(:expired_status) { create(:idea_status, code: 'ineligible') }
      let(:input) { create(:idea, project: project, phases: [project.phases[2]], idea_status: expired_status) }

      it "returns 'not_reactable_status_code'" do
        expect(reason).to eq 'not_reactable_status_code'
      end
    end

    context 'when the idea is not in the current phase' do
      let(:input) { create(:idea, project: project, phases: [project.phases[1]]) }

      it "returns `idea_not_in_current_phase` when it's not in the current phase" do
        expect(reason).to eq 'idea_not_in_current_phase'
      end
    end

    context 'when reacting is disabled' do
      let(:current_phase_attrs) { { reacting_enabled: false } }

      it "returns 'reacting_disabled' if it's in the current phase and reacting is disabled" do
        expect(reason).to eq 'reacting_disabled'
      end
    end

    context 'when the timeline has not started' do
      let(:project) { create(:project_with_future_phases) }
      let(:input) { create(:idea, project: project, phases: project.phases) }

      it "returns 'project_inactive'" do
        expect(reason).to eq 'project_inactive'
      end
    end

    context "when we're in a voting (budgeting) context" do
      let(:current_phase_attrs) { { participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 1200 } }
      let(:input) { create(:idea, project: project, phases: project.phases) }

      it 'returns `reacting_not_supported`' do
        expect(reason).to eq 'reacting_not_supported'
      end
    end

    context 'when the project is archived' do
      let(:project) { create(:single_phase_ideation_project, admin_publication_attributes: { publication_status: 'archived' }) }
      let(:input) { create(:idea, project: project, phases: project.phases) }

      it "returns 'project_inactive'" do
        expect(reason).to eq 'project_inactive'
      end
    end

    describe 'with phase permissions' do
      let(:current_phase_attrs) { { with_permissions: true, permissions_config: { reacting_idea: false } } }

      context 'when the user is not signed in' do
        let(:user) { nil }

        it "returns `user_not_signed_in` if it's in the current phase and user needs to be signed in" do
          TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'reacting_idea')
            .update!(permitted_by: 'users')
          expect(reason).to eq 'user_not_signed_in'
        end
      end

      it "returns 'user_not_permitted' if it's in the current phase and reacting is not permitted" do
        expect(reason).to eq 'user_not_permitted'
      end

      context 'when the user is not in the group' do
        let(:project) { create(:single_phase_ideation_project, phase_attrs: { with_permissions: true }) }
        let(:input) { create(:idea, project: project, phases: project.phases) }

        it "returns 'user_not_in_group' if reacting is not permitted" do
          permission = project.phases.first.permissions.find_by(action: 'reacting_idea')
          permission.update!(
            permitted_by: 'users',
            group_ids: create_list(:group, 2).map(&:id)
          )
          expect(reason).to eq 'user_not_in_group'
        end
      end
    end

    context 'on a proposal' do
      let(:project) { phase.project }
      let(:input) { create(:proposal, project: project, creation_phase: phase) }

      context 'when the timeline is over' do
        let(:phase) { create(:proposals_phase, start_at: 10.days.ago, end_at: 5.days.ago) }

        it "returns 'project_inactive'" do
          expect(reason).to eq 'project_inactive'
        end
      end
    end

    context 'when permitted group requires verification' do
      let(:current_phase_attrs) { { with_permissions: true, reacting_dislike_enabled: true } }

      context 'when in the current phase and reacting is not permitted' do
        it "returns 'user_not_verified'" do
          permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'reacting_idea')
          verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
          permission.update!(permitted_by: 'users', groups: [create(:group), verified_members])
          expect(service.denied_reason_for_reaction_mode('up')).to eq 'user_not_verified'
          expect(service.denied_reason_for_reaction_mode('down')).to eq 'user_not_verified'
        end
      end

      context 'for an unauthenticated visitor' do
        let(:user) { nil }

        it "returns 'user_not_signed_in' if reacting is not permitted" do
          permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'reacting_idea')
          group = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
          permission.update!(permitted_by: 'users', groups: [create(:group), group])
          expect(service.denied_reason_for_reaction_mode('up')).to eq 'user_not_signed_in'
          expect(service.denied_reason_for_reaction_mode('down')).to eq 'user_not_signed_in'
        end
      end
    end
  end

  describe 'denied_reason_for_reaction_mode' do
    let(:input) { create(:idea, project: project, phases: project.phases) }

    context 'when reacting is enabled' do
      let(:current_phase_attrs) { { reacting_enabled: true, reacting_dislike_enabled: true } }

      it 'returns nil' do
        expect(service.denied_reason_for_reaction_mode('up')).to be_nil
        expect(service.denied_reason_for_reaction_mode('down')).to be_nil
      end
    end

    context "when the timeline hasn't started" do
      let(:project) { create(:project_with_future_phases) }

      it 'returns `project_inactive`' do
        expect(service.denied_reason_for_reaction_mode('up')).to eq 'project_inactive'
        expect(service.denied_reason_for_reaction_mode('down')).to eq 'project_inactive'
      end
    end

    context 'when the timeline has finished' do
      let(:project) { create(:project_with_past_phases) }

      it 'returns `project_inactive`' do
        expect(service.denied_reason_for_reaction_mode('up')).to eq 'project_inactive'
        expect(service.denied_reason_for_reaction_mode('down')).to eq 'project_inactive'
      end
    end

    context "when we're in a voting (budgeting) context" do
      let(:project) { create(:single_phase_budgeting_project) }

      it 'returns `reacting_not_supported`' do
        expect(service.denied_reason_for_reaction_mode('up')).to eq 'reacting_not_supported'
        expect(service.denied_reason_for_reaction_mode('down')).to eq 'reacting_not_supported'
      end
    end

    context "when it's not in the current phase" do
      let(:project) { create(:project_with_current_phase, phases_config: { sequence: 'xxcxx' }, current_phase_attrs: { reacting_enabled: true, reacting_dislike_enabled: true }) }
      let(:idea_phases) { project.phases.order(:start_at).take(2) + [project.phases.order(:start_at).last] }
      let(:input) { create(:idea, project: project, phases: idea_phases) }

      it 'returns `idea_not_in_current_phase`' do
        expect(service.denied_reason_for_reaction_mode('up')).to eq 'idea_not_in_current_phase'
        expect(service.denied_reason_for_reaction_mode('down')).to eq 'idea_not_in_current_phase'
      end
    end

    context 'when reacting is disabled' do
      let(:project) { create(:single_phase_ideation_project, phase_attrs: { reacting_enabled: false }) }

      it 'returns `reacting_disabled`' do
        expect(service.denied_reason_for_reaction_mode('up')).to eq 'reacting_disabled'
        expect(service.denied_reason_for_reaction_mode('down')).to eq 'reacting_disabled'
      end
    end

    context 'when disliking is disabled' do
      let(:project) { create(:single_phase_ideation_project, phase_attrs: { reacting_enabled: true, reacting_dislike_enabled: false }) }

      it 'returns `reacting_dislike_disabled` for dislikes only' do
        expect(service.denied_reason_for_reaction_mode('up')).to be_nil
        expect(service.denied_reason_for_reaction_mode('down')).to eq 'reacting_dislike_disabled'
      end
    end

    context 'when likes are limited' do
      let(:project) { create(:single_phase_ideation_project, phase_attrs: { reacting_enabled: true, reacting_like_method: 'limited', reacting_like_limited_max: 1, reacting_dislike_enabled: true }) }

      it 'returns `reacting_like_limited_max_reached` when the like limit was reached' do
        create(:reaction, mode: 'up', user: user, reactable: input)
        expect(service.denied_reason_for_reaction_mode('up')).to eq 'reacting_like_limited_max_reached'
        expect(service.denied_reason_for_reaction_mode('down')).to be_nil
      end

      it 'does not return `reacting_like_limited_max_reached` when deleting a reaction' do
        create(:reaction, mode: 'up', user: user, reactable: input)
        expect(service.denied_reason_for_reaction_mode('up', delete_action: true)).to be_nil
      end

      it 'returns nil if the like limit was not reached' do
        create(:reaction, mode: 'down', user: user, reactable: input)
        expect(service.denied_reason_for_reaction_mode('up')).to be_nil
        expect(service.denied_reason_for_reaction_mode('down')).to be_nil
      end
    end

    context 'when dislikes are limited' do
      let(:project) do
        create(
          :single_phase_ideation_project,
          phase_attrs: {
            reacting_enabled: true,
            reacting_dislike_enabled: true,
            reacting_dislike_method: 'limited',
            reacting_dislike_limited_max: 1
          }
        )
      end

      it 'returns `reacting_dislike_limited_max_reached` if the dislike limit was reached' do
        create(:reaction, mode: 'down', user: user, reactable: input)
        expect(service.denied_reason_for_reaction_mode('up')).to be_nil
        expect(service.denied_reason_for_reaction_mode('down')).to eq 'reacting_dislike_limited_max_reached'
      end

      it 'returns nil if the disliking limit was not reached' do
        create(:reaction, mode: 'up', user: user, reactable: input)
        expect(service.denied_reason_for_reaction_mode('up')).to be_nil
        expect(service.denied_reason_for_reaction_mode('down')).to be_nil
      end
    end

    context 'with phase permissions' do
      let(:reasons) { Permissions::PhasePermissionsService::REACTING_DENIED_REASONS }

      let(:current_phase_attrs) { { with_permissions: true, reacting_dislike_enabled: true } }
      let(:input) { create(:idea, project: project, phases: [project.phases[2]]) }
      let(:permission) do
        TimelineService.new.current_phase_not_archived(project).permissions
          .find_by(action: 'reacting_idea')
      end

      context 'when the user is not signed in' do
        let(:user) { nil }

        it 'returns `user_not_signed_in` when user needs to be signed in' do
          permission.update!(permitted_by: 'users')
          expect(service.denied_reason_for_reaction_mode('up')).to eq 'user_not_signed_in'
          expect(service.denied_reason_for_reaction_mode('down')).to eq 'user_not_signed_in'
        end
      end

      it "returns 'user_not_in_group' if it's in the current phase and reacting is not permitted" do
        permission.update!(permitted_by: 'users', groups: create_list(:group, 2))
        expect(service.denied_reason_for_reaction_mode('up')).to eq 'user_not_in_group'
        expect(service.denied_reason_for_reaction_mode('down')).to eq 'user_not_in_group'
      end
    end
  end

  describe '"voting" disabled_reasons' do
    let(:action) { 'voting' }
    let(:current_phase_attrs) { { with_permissions: true, participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 10_000 } }

    context 'when voting is allowed in the current phase' do
      let(:project) do
        create(
          :project_with_current_phase,
          phases_config: { sequence: 'xxcxx' },
          current_phase_attrs: { participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 10_000 }
        )
      end

      it 'returns nil when the idea is in the current phase and budgeting is allowed' do
        expect(reason).to be_nil
      end

      context 'when the idea is not in the current phase' do
        let(:input) { create(:idea, project: project, phases: [project.phases[1]]) }

        it 'returns `idea_not_in_current_phase`' do
          expect(reason).to eq 'idea_not_in_current_phase'
        end
      end
    end

    context 'when the user is not signed in' do
      let(:user) { nil }

      it 'returns `user_not_signed_in` when user needs to be signed in' do
        permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'voting')
        permission.update!(permitted_by: 'users')
        expect(reason).to eq 'user_not_signed_in'
      end
    end

    it 'returns `user_not_in_group` when the idea is in the current phase and voting is not permitted' do
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'voting')
      permission.update!(
        permitted_by: 'users',
        group_ids: create_list(:group, 2).map(&:id)
      )
      expect(reason).to eq 'user_not_in_group'
    end

    context 'when the timeline is over' do
      let(:project) { create(:project_with_past_phases) }

      it "returns 'project_inactive'" do
        expect(reason).to eq 'project_inactive'
      end
    end

    context 'when the project is archived' do
      let(:project) { create(:single_phase_budgeting_project, admin_publication_attributes: { publication_status: 'archived' }) }
      let(:input) { create(:idea, project: project) }

      it "returns 'project_inactive'" do
        expect(reason).to eq 'project_inactive'
      end
    end

    context 'permitted group requires verification' do
      let(:current_phase_attrs) { { with_permissions: true, participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 10_000 } }

      it 'returns `user_not_verified` when the idea is in the current phase and budgeting is not permitted' do
        permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'voting')
        verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
        permission.update!(permitted_by: 'users', groups: [create(:group), verified_members])
        expect(service.denied_reason_for_action('voting')).to eq 'user_not_verified'
      end
    end
  end

  describe 'action_descriptors' do
    it 'does not run more than 3 queries for 5 ideas in a project with default user permissions' do
      user = create(:user)
      phase = TimelineService.new.current_phase(create(:project_with_current_phase))
      create(:permission, action: 'posting_idea', permission_scope: phase, permitted_by: 'users')
      create(:permission, action: 'commenting_idea', permission_scope: phase, permitted_by: 'users')
      create(:permission, action: 'reacting_idea', permission_scope: phase, permitted_by: 'users')
      create_list(:idea, 5, project: phase.project, phases: [phase])

      # Load ideas with pre-loading as loaded by the controller
      ideas = Idea.includes(
        :idea_images, :idea_trending_info, :input_topics,
        :idea_import,
        :phases,
        :idea_status,
        {
          project: [:admin_publication, { phases: { permissions: [:groups] } }, { custom_form: [:custom_fields] }],
          author: [:unread_notifications]
        }
      )

      # First check ideas length sure all the 'ideas' queries are preloaded
      expect(ideas.length).to eq 5
      user_requirements_service = Permissions::UserRequirementsService.new(check_groups_and_verification: false)
      expect do
        ideas.each do |idea|
          described_class.new(idea, user, user_requirements_service: user_requirements_service).action_descriptors
        end
      end.not_to exceed_query_limit(3) # Down from an original 486
    end
  end
end
