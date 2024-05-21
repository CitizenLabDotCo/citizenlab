# frozen_string_literal: true

require 'rails_helper'

describe Permissions::IdeaPermissionsService do
  let(:service) { described_class.new }

  before do
    SettingsService.new.activate_feature! 'user_confirmation'
  end

  describe '"commenting_idea" denied_reason_for_idea' do
    let(:user) { create(:user) }

    it 'returns nil when the commenting is allowed in the current phase' do
      project = create(:project_with_current_phase)
      idea = create(:idea, project: project, phases: [project.phases[2]])
      expect(service.denied_reason_for_action('commenting_idea', user, idea)).to be_nil
    end

    it 'returns `commenting_disabled` when commenting is disabled in the current phase' do
      project = create(
        :project_with_current_phase,
        current_phase_attrs: { commenting_enabled: false }
      )
      idea = create(:idea, project: project, phases: [project.phases[2]])
      expect(service.denied_reason_for_action('commenting_idea', user, idea)).to eq 'commenting_disabled'
    end

    it "returns 'project_inactive' when the timeline hasn't started" do
      project = create(:project_with_future_phases)
      idea = create(:idea, project: project, phases: [project.phases[2]])
      expect(service.denied_reason_for_action('commenting_idea', user, idea)).to eq 'project_inactive'
    end

    it "returns 'project_inactive' when the timeline is over" do
      project = create(:project_with_past_phases)
      idea = create(:idea, project: project, phases: [project.phases[2]])
      expect(service.denied_reason_for_action('commenting_idea', user, idea)).to eq 'project_inactive'
    end

    it "returns 'project_inactive' when the project is archived" do
      project = create(:project_with_current_phase, admin_publication_attributes: { publication_status: 'archived' })
      idea = create(:idea, project: project, phases: [project.phases[2]])
      expect(service.denied_reason_for_action('commenting_idea', user, idea)).to eq 'project_inactive'
    end

    it "returns nil when we're in a participatory budgeting context" do
      project = create(
        :project_with_current_phase,
        current_phase_attrs: { participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 1200 }
      )
      idea = create(:idea, project: project, phases: [project.phases[2]])
      expect(service.denied_reason_for_action('commenting_idea', user, idea)).to be_nil
    end

    it "returns 'idea_not_in_current_phase' for an idea when it's not in the current phase" do
      project = create(:project_with_current_phase)
      idea = create(:idea, project: project, phases: [project.phases[1]])
      expect(service.denied_reason_for_action('commenting_idea', user, idea)).to eq 'idea_not_in_current_phase'
    end

    context 'with phase permissions' do
      let(:project) { create(:project_with_current_phase, current_phase_attrs: { with_permissions: true }) }
      let(:permission) do
        TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'commenting_idea')
      end

      it 'returns `user_not_signed_in` when user needs to be signed in' do
        permission.update!(permitted_by: 'users')
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.denied_reason_for_action('commenting_idea', nil, idea)).to eq 'user_not_signed_in'
      end

      it 'returns `user_not_in_group` commenting is not permitted for the user' do
        permission.update!(permitted_by: 'groups', groups: create_list(:group, 2))
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.denied_reason_for_action('commenting_idea', user, idea)).to eq 'user_not_in_group'
      end

      it "returns 'commenting_disabled' when commenting is disabled in the phase" do
        project.phases[2].update!(commenting_enabled: false)
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.denied_reason_for_action('commenting_idea', user, idea)).to eq 'commenting_disabled'
      end
    end
  end

  describe '"reacting_idea" denied_reason_for_idea' do
    let(:user) { create(:user) }

    context 'a reaction' do
      # TODO: JS - No tests for up/down mode
      it 'returns nil when reacting is enabled in the current phase' do
        project = create(:project_with_current_phase, current_phase_attrs: { reacting_enabled: true })
        idea = create(:idea, project: project, phases: project.phases)
        reaction = build(:reaction, user: user, reactable: idea)
        expect(service.denied_reason_for_idea_reaction(user, reaction)).to be_nil
      end

      it "returns `project_inactive` when the timeline hasn't started yet" do
        project = create(:project_with_future_phases)
        idea = create(:idea, project: project, phases: project.phases)
        reaction = build(:reaction, user: user, reactable: idea)
        expect(service.denied_reason_for_idea_reaction(user, reaction)).to eq 'project_inactive'
      end

      it "returns `idea_not_in_current_phase` when it's not in the current phase" do
        project = create(
          :project_with_current_phase,
          phases_config: { sequence: 'xxcxx' },
          current_phase_attrs: { reacting_enabled: true }
        )
        idea_phases = project.phases.order(:start_at).take(2) + [project.phases.order(:start_at).last]
        idea = create(:idea, project: project, phases: idea_phases)
        reaction = build(:reaction, user: user, reactable: idea)
        expect(service.denied_reason_for_idea_reaction(user, reaction)).to eq 'idea_not_in_current_phase'
      end

      it 'returns `reacting_disabled` if reacting is disabled' do
        project = create(:single_phase_ideation_project, phase_attrs: { reacting_enabled: false })
        idea = create(:idea, project: project, phases: project.phases)
        reaction = build(:reaction, user: user, reactable: idea)
        expect(service.denied_reason_for_idea_reaction(user, reaction)).to eq 'reacting_disabled'
      end

      it 'returns `reacting_dislike_disabled` for a dislike if disliking is disabled' do
        project = create(:single_phase_ideation_project, phase_attrs: { reacting_enabled: true, reacting_dislike_enabled: false })
        idea = create(:idea, project: project, phases: project.phases)
        reaction = build(:reaction, mode: 'down', user: user, reactable: idea)
        expect(service.denied_reason_for_idea_reaction(user, reaction)).to eq 'reacting_dislike_disabled'
      end

      it 'returns nil for a like if disliking is disabled' do
        project = create(:single_phase_ideation_project, phase_attrs: { reacting_enabled: true, reacting_dislike_enabled: false })
        idea = create(:idea, project: project, phases: project.phases)
        reaction = build(:reaction, mode: 'up', user: user, reactable: idea)
        expect(service.denied_reason_for_idea_reaction(user, reaction)).to be_nil
      end

      it "returns nil for a dislike, but while the mode is explicitly specified as 'up', even though disliking is disabled" do
        project = create(:single_phase_ideation_project, phase_attrs: { reacting_enabled: true, reacting_dislike_enabled: false })
        idea = create(:idea, project: project, phases: project.phases)
        reaction = build(:reaction, mode: 'down', user: user, reactable: idea)
        expect(service.denied_reason_for_idea_reaction(user, reaction, reaction_mode: 'up')).to be_nil
      end

      it 'returns `reacting_like_limited_max_reached` if the like limit was reached' do
        project = create(:single_phase_ideation_project, phase_attrs: { reacting_enabled: true, reacting_like_method: 'limited', reacting_like_limited_max: 1 })
        idea = create(:idea, project: project, phases: project.phases)
        create(:reaction, mode: 'up', user: user, reactable: idea)
        reaction = build(:reaction, mode: 'up', user: user, reactable: idea)
        expect(service.denied_reason_for_idea_reaction(user, reaction)).to eq 'reacting_like_limited_max_reached'
      end

      it 'returns nil if the like limit was not reached' do
        project = create(:single_phase_ideation_project, phase_attrs: { reacting_enabled: true, reacting_like_method: 'limited', reacting_like_limited_max: 1 })
        idea = create(:idea, project: project, phases: project.phases)
        create(:reaction, mode: 'down', user: user, reactable: idea)
        reaction = build(:reaction, mode: 'up', user: user, reactable: idea)
        expect(service.denied_reason_for_idea_reaction(user, reaction)).to be_nil
      end

      it 'returns `reacting_dislike_limited_max_reached` if the disliking limit was reached' do
        project = create(:single_phase_ideation_project, phase_attrs: {
          reacting_enabled: true, reacting_dislike_enabled: true,
          reacting_dislike_method: 'limited', reacting_dislike_limited_max: 1
        })
        idea = create(:idea, project: project, phases: project.phases)
        create(:reaction, mode: 'down', user: user, reactable: idea)
        reaction = build(:reaction, mode: 'down', user: user, reactable: idea)
        expect(service.denied_reason_for_idea_reaction(user, reaction)).to eq 'reacting_dislike_limited_max_reached'
      end

      it 'returns nil if the disliking limit was not reached' do
        project = create(:single_phase_ideation_project, phase_attrs: {
          reacting_enabled: true, reacting_dislike_enabled: true,
          reacting_dislike_method: 'limited', reacting_dislike_limited_max: 1
        })
        idea = create(:idea, project: project, phases: project.phases)
        create(:reaction, mode: 'up', user: user, reactable: idea)
        reaction = build(:reaction, mode: 'down', user: user, reactable: idea)
        expect(service.denied_reason_for_idea_reaction(user, reaction)).to be_nil
      end
    end

    context 'an idea' do
      context 'with up/down mode' do
        it 'returns nil when reacting is enabled' do
          project = create(:single_phase_ideation_project, phase_attrs: { reacting_enabled: true })
          idea = create(:idea, project: project, phases: project.phases)
          expect(service.denied_reason_for_action('reacting_idea', user, idea, reaction_mode: 'up')).to be_nil
          expect(service.denied_reason_for_action('reacting_idea', user, idea, reaction_mode: 'down')).to be_nil
        end

        it 'returns `project_inactive` when the timeline has past' do
          project = create(:project_with_past_phases)
          idea = create(:idea, project: project, phases: project.phases)
          expect(service.denied_reason_for_action('reacting_idea', user, idea, reaction_mode: 'up')).to eq 'project_inactive'
          expect(service.denied_reason_for_action('reacting_idea', user, idea, reaction_mode: 'down')).to eq 'project_inactive'
        end

        it "returns `reacting_not_supported` when we're in a voting (budgeting) phase" do
          project = create(:single_phase_budgeting_project)
          idea = create(:idea, project: project)
          expect(service.denied_reason_for_action('reacting_idea', user, idea, reaction_mode: 'up')).to eq 'reacting_not_supported'
          expect(service.denied_reason_for_action('reacting_idea', user, idea, reaction_mode: 'down')).to eq 'reacting_not_supported'
        end

        it "returns `idea_not_in_current_phase` when it's not in the current phase" do
          project = create(
            :project_with_current_phase,
            phases_config: { sequence: 'xxcxx' },
            current_phase_attrs: { reacting_enabled: true }
          )
          idea_phases = [project.phases.order(:start_at).first, project.phases.order(:start_at).last]
          idea = create(:idea, project: project, phases: idea_phases)
          expect(service.denied_reason_for_action('reacting_idea', user, idea, reaction_mode: 'up')).to eq 'idea_not_in_current_phase'
          expect(service.denied_reason_for_action('reacting_idea', user, idea, reaction_mode: 'down')).to eq 'idea_not_in_current_phase'
        end

        it 'returns `reacting_dislike_limited_max_reached` if the dislike limit was reached' do
          project = create(:single_phase_ideation_project, phase_attrs: {
            reacting_enabled: true, reacting_dislike_enabled: true,
            reacting_dislike_method: 'limited', reacting_dislike_limited_max: 1
          })
          idea = create(:idea, project: project, phases: project.phases)
          create(:reaction, mode: 'down', user: user, reactable: idea)
          expect(service.denied_reason_for_action('reacting_idea', user, idea, reaction_mode: 'up')).to be_nil
          expect(service.denied_reason_for_action('reacting_idea', user, idea, reaction_mode: 'down')).to eq 'reacting_dislike_limited_max_reached'
        end
      end

      context 'without up/down' do
        let(:user) { create(:user) }

        it 'returns nil when reacting is enabled in the current phase' do
          project = create(:project_with_current_phase)
          idea = create(:idea, project: project, phases: [project.phases[2]])
          expect(service.denied_reason_for_action('reacting_idea', idea.author, idea)).to be_nil
        end

        it "returns `idea_not_in_current_phase` when it's not in the current phase" do
          project = create(:project_with_current_phase)
          idea = create(:idea, project: project, phases: [project.phases[1]])
          expect(service.denied_reason_for_action('reacting_idea', idea.author, idea)).to eq 'idea_not_in_current_phase'
        end

        it "returns 'reacting_disabled' if it's in the current phase and reacting is disabled" do
          project = create(:project_with_current_phase, current_phase_attrs: { reacting_enabled: false })
          idea = create(:idea, project: project, phases: [project.phases[2]])
          expect(service.denied_reason_for_action('reacting_idea', idea.author, idea)).to eq 'reacting_disabled'
        end

        it "returns 'project_inactive' when the timeline has past" do
          project = create(:project_with_past_phases)
          idea = create(:idea, project: project, phases: project.phases)
          expect(service.denied_reason_for_action('reacting_idea', idea.author, idea)).to eq 'project_inactive'
        end

        it "returns `reacting_not_supported` when we're in a participatory budgeting context" do
          project = create(
            :project_with_current_phase,
            current_phase_attrs: { participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 1200 }
          )
          idea = create(:idea, project: project, phases: project.phases)
          expect(service.denied_reason_for_action('reacting_idea', idea.author, idea)).to eq 'reacting_not_supported'
        end

        it "returns 'project_inactive' when the project is archived" do
          project = create(:single_phase_ideation_project, admin_publication_attributes: { publication_status: 'archived' })
          idea = create(:idea, project: project, phases: project.phases)
          expect(service.denied_reason_for_action('reacting_idea', idea.author, idea)).to eq 'project_inactive'
        end

        describe 'with phase permissions' do
          let(:project) do
            create(:project_with_current_phase, current_phase_attrs: { with_permissions: true, permissions_config: { reacting_idea: false } })
          end
          let(:idea) { create(:idea, project: project, phases: [project.phases[2]]) }

          it "returns `user_not_signed_in` if it's in the current phase and user needs to be signed in" do
            TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'reacting_idea')
              .update!(permitted_by: 'users')
            expect(service.denied_reason_for_action('reacting_idea', nil, idea)).to eq 'user_not_signed_in'
          end

          it "returns 'user_not_permitted' if it's in the current phase and reacting is not permitted" do
            expect(service.denied_reason_for_action('reacting_idea', idea.author, idea)).to eq 'user_not_permitted'
          end

          it "returns 'user_not_in_group' if reacting is not permitted" do
            project = create(:single_phase_ideation_project, phase_attrs: { with_permissions: true })
            idea = create(:idea, project: project, phases: project.phases)
            permission = project.phases.first.permissions.find_by(action: 'reacting_idea')
            permission.update!(
              permitted_by: 'groups',
              group_ids: create_list(:group, 2).map(&:id)
            )
            expect(service.denied_reason_for_action('reacting_idea', idea.author, idea)).to eq 'user_not_in_group'
          end
        end
      end
    end

    describe 'with phase permissions' do
      let(:reasons) { Permissions::PhasePermissionsService::REACTING_DENIED_REASONS }

      let(:project) { create(:project_with_current_phase, current_phase_attrs: { with_permissions: true }) }
      let(:idea) { create(:idea, project: project, phases: [project.phases[2]]) }
      let(:permission) do
        TimelineService.new.current_phase_not_archived(project).permissions
          .find_by(action: 'reacting_idea')
      end

      it 'returns `user_not_signed_in` when user needs to be signed in' do
        permission.update!(permitted_by: 'users')
        expect(service.denied_reason_for_action('reacting_idea', nil, idea, reaction_mode: 'up')).to eq 'user_not_signed_in'
        expect(service.denied_reason_for_action('reacting_idea', nil, idea, reaction_mode: 'down')).to eq 'user_not_signed_in'
      end

      it "returns 'user_not_in_group' if it's in the current phase and reacting is not permitted" do
        permission.update!(permitted_by: 'groups', groups: create_list(:group, 2))
        expect(service.denied_reason_for_action('reacting_idea', user, idea, reaction_mode: 'up')).to eq 'user_not_in_group'
        expect(service.denied_reason_for_action('reacting_idea', user, idea, reaction_mode: 'down')).to eq 'user_not_in_group'
      end
    end
  end

  describe '"voting" disabled_reasons' do
    it 'returns nil when the idea is in the current phase and budgeting is allowed' do
      project = create(:project_with_current_phase, phases_config: {
        sequence: 'xxcxx'
      }, current_phase_attrs: { participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 10_000 })
      idea = create(:idea, project: project, phases: [project.phases[2]])
      expect(service.denied_reason_for_action('voting', create(:user), idea)).to be_nil
    end

    it 'returns `idea_not_in_current_phase` when the idea is not in the current phase, budgeting is allowed in the current phase and was allowed in the last phase the idea was part of' do
      project = create(:project_with_current_phase, phases_config: {
        sequence: 'xxcxx'
      }, current_phase_attrs: { participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 10_000 })
      idea = create(:idea, project: project, phases: [project.phases[1]])
      expect(service.denied_reason_for_action('voting', create(:user), idea)).to eq 'idea_not_in_current_phase'
    end

    it "returns 'idea_not_in_current_phase' when the idea is not in the current phase, budgeting is permitted but was not permitted in the last phase the idea was part of" do
      project = create(
        :project_with_current_phase,
        current_phase_attrs: { participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 10_000 }
      )
      phase = project.phases[1]
      permission = phase.permissions.find_by(action: 'voting')
      permission&.update!(
        permitted_by: 'groups',
        group_ids: create_list(:group, 2).map(&:id)
      )
      idea = create(:idea, project: project, phases: [project.phases[0], project.phases[1]])
      expect(service.denied_reason_for_action('voting', create(:user), idea)).to eq 'idea_not_in_current_phase'
    end

    it 'returns `user_not_signed_in` when user needs to be signed in' do
      project = create(
        :project_with_current_phase,
        current_phase_attrs: { with_permissions: true, participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 10_000 }
      )
      idea = create(:idea, project: project, phases: [project.phases[2]])
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'voting')
      permission.update!(permitted_by: 'users')
      expect(service.denied_reason_for_action('voting', nil, idea)).to eq 'user_not_signed_in'
    end

    it 'returns `user_not_in_group` when the idea is in the current phase and voting is not permitted' do
      project = create(
        :project_with_current_phase,
        current_phase_attrs: { with_permissions: true, participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 10_000 }
      )
      idea = create(:idea, project: project, phases: [project.phases[2]])
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'voting')
      permission.update!(
        permitted_by: 'groups',
        group_ids: create_list(:group, 2).map(&:id)
      )
      expect(service.denied_reason_for_action('voting', create(:user), idea)).to eq 'user_not_in_group'
    end

    it "returns 'project_inactive' when the timeline is over" do
      project = create(:project_with_past_phases)
      idea = create(:idea, project: project, phases: [project.phases[2]])
      expect(service.denied_reason_for_action('voting', create(:user), idea)).to eq 'project_inactive'
    end

    it "returns 'project_inactive' when the project is archived" do
      project = create(:single_phase_budgeting_project, admin_publication_attributes: { publication_status: 'archived' })
      idea = create(:idea, project: project)
      expect(service.denied_reason_for_action('voting', create(:user), idea)).to eq 'project_inactive'
    end
  end

  describe 'action_descriptors' do
    it 'does not run more than 11 queries for 5 ideas in a project with default user permissions' do
      user = create(:user)
      phase = TimelineService.new.current_phase(create(:project_with_current_phase))
      create(:permission, action: 'posting_idea', permission_scope: phase, permitted_by: 'users')
      create(:permission, action: 'commenting_idea', permission_scope: phase, permitted_by: 'users')
      create(:permission, action: 'reacting_idea', permission_scope: phase, permitted_by: 'users')
      create_list(:idea, 5, project: phase.project, phases: [phase])

      # Load ideas with pre-loading as loaded by the controller
      ideas = Idea.includes(
        :idea_images, :idea_trending_info, :topics,
        :idea_import,
        :phases,
        {
          project: [:admin_publication, { phases: { permissions: [:groups] } }, { custom_form: [:custom_fields] }],
          author: [:unread_notifications]
        }
      )

      # First check ideas length sure all the 'ideas' queries are preloaded
      expect(ideas.length).to eq 5
      expect do
        ideas.each do |idea|
          service.action_descriptors(idea, user)
        end
      end.not_to exceed_query_limit(7) # Down from an original 486
    end
  end
end
