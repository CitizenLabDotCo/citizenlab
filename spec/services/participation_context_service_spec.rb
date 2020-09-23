require "rails_helper"

describe ParticipationContextService do
  let(:service) { ParticipationContextService.new }

  describe "get_participation_context" do

    it "returns the project for a continuous project" do
      project = create(:continuous_project)
      expect(service.get_participation_context(project)).to eq project
    end

    it "returns the active phase for a timeline project" do
      random_title = SecureRandom.uuid
      project = create(:project_with_current_phase, 
        current_phase_attrs: {title_multiloc: {'en' => random_title} }
        )
      expect(service.get_participation_context(project)&.title_multiloc.dig('en')).to eq random_title
    end

    it "returns nil for a timeline project without an active phase" do
      project = create(:project_with_past_phases)
      expect(service.get_participation_context(project)).to eq nil
    end

    it "returns nil for a timeline project that's archived" do
      project = create(:project_with_current_phase, admin_publication_attributes: {publication_status: 'archived'})
      expect(service.get_participation_context(project)).to eq nil
    end

    it "returns nil for a continuous project that's archived" do
      project = create(:continuous_project, admin_publication_attributes: {publication_status: 'archived'})
      expect(service.get_participation_context(project)).to eq nil
    end
  end

  describe "posting_idea_disabled_reason_for_project" do
    it "returns nil when posting is allowed" do
      project = create(:project_with_current_phase, with_permissions: true)
      permission = service.get_participation_context(project).permissions.find_by(action: 'posting_idea')
      groups = create_list(:group, 2, projects: [project])
      permission.update!(permitted_by: 'groups', group_ids: groups.map(&:id))
      user = create(:user)
      group = groups.first
      group.add_member user
      group.save!
      expect(service.posting_idea_disabled_reason_for_project(project, user)).to be_nil
    end

    it "returns `posting_disabled` when posting is disabled" do
      project = create(:project_with_current_phase, current_phase_attrs: {posting_enabled: false})
      expect(service.posting_idea_disabled_reason_for_project(project, create(:user))).to eq 'posting_disabled'
    end

    it "returns `not_signed_in` when user needs to be signed in" do
      project = create(:project_with_current_phase, with_permissions: true)
      permission = service.get_participation_context(project).permissions.find_by(action: 'posting_idea')
      permission.update!(permitted_by: 'users')
      expect(service.posting_idea_disabled_reason_for_project(project, nil)).to eq 'not_signed_in'
    end

    it "returns `not_permitted` when posting is not permitted" do
      project = create(:project_with_current_phase, with_permissions: true)
      permission = service.get_participation_context(project).permissions.find_by(action: 'posting_idea')
      permission.update!(permitted_by: 'groups', 
        group_ids: create_list(:group, 2).map(&:id)
        )
      expect(service.posting_idea_disabled_reason_for_project(project, create(:user))).to eq 'not_permitted'
    end

    it "returns `not_ideation` when we're not in an ideation context" do
      project = create(:project_with_current_phase, 
        with_permissions: true, 
        current_phase_attrs: {participation_method: 'information'}
        )
      expect(service.posting_idea_disabled_reason_for_project(project, create(:user))).to eq 'not_ideation'
    end

    it "returns `not_ideation` when we're in a participatory budgeting context" do
      project = create(:project_with_current_phase, 
        with_permissions: true, 
        current_phase_attrs: {participation_method: 'budgeting', max_budget: 1200}
        )
      expect(service.posting_idea_disabled_reason_for_project(project, create(:user))).to eq 'not_ideation'
    end

    it "returns `project_inactive` when the timeline is over" do
      project = create(:project_with_past_phases, with_permissions: true)
      expect(service.posting_idea_disabled_reason_for_project(project, create(:user))).to eq 'project_inactive'
    end

    it "returns 'project_inactive' when the project is archived" do
      project = create(:continuous_project, admin_publication_attributes: {publication_status: 'archived'})
      expect(service.posting_idea_disabled_reason_for_project(project, create(:user))).to eq 'project_inactive'
    end
  end

  describe "commenting_idea_disabled_reason_for_project" do
    let (:user) { create(:user) }

    context "for timeline projects" do
      it "returns nil when the commenting is allowed in the current phase" do
        project = create(:project_with_current_phase, with_permissions: true)
        expect(service.commenting_idea_disabled_reason_for_project(project, user)).to be_nil
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.commenting_disabled_reason_for_idea(idea, user)).to be_nil
      end

      it "returns `commenting_disabled` when commenting is disabled in the current phase" do
        project = create(:project_with_current_phase, 
          current_phase_attrs: {commenting_enabled: false},
        )
        expect(service.commenting_idea_disabled_reason_for_project(project, user)).to eq 'commenting_disabled'
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.commenting_disabled_reason_for_idea(idea, user)).to eq 'commenting_disabled'
      end

      it "returns `not_signed_in` when user needs to be signed in" do
        project = create(:project_with_current_phase, with_permissions: true)
        permission = service.get_participation_context(project).permissions.find_by(action: 'commenting_idea')
        permission.update!(permitted_by: 'users')
        expect(service.commenting_idea_disabled_reason_for_project(project, nil)).to eq 'not_signed_in'
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.commenting_disabled_reason_for_idea(idea, nil)).to eq 'not_signed_in'
      end

      it "returns `not_permitted` commenting is not permitted for the user" do
        project = create(:project_with_current_phase, with_permissions: true)
        permission = service.get_participation_context(project).permissions.find_by(action: 'commenting_idea')
        permission.update!(permitted_by: 'groups', 
          group_ids: create_list(:group, 2).map(&:id)
          )
        expect(service.commenting_idea_disabled_reason_for_project(project, user)).to eq 'not_permitted'
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.commenting_disabled_reason_for_idea(idea, user)).to eq 'not_permitted'
      end

      it "returns 'project_inactive' when the timeline hasn't started" do
        project = create(:project_with_future_phases, with_permissions: true)
        expect(service.commenting_idea_disabled_reason_for_project(project, user)).to eq 'project_inactive'
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.commenting_disabled_reason_for_idea(idea, user)).to eq 'project_inactive'
      end

      it "returns 'project_inactive' when the timeline is over" do
        project = create(:project_with_past_phases, with_permissions: true)
        expect(service.commenting_idea_disabled_reason_for_project(project, user)).to eq 'project_inactive'
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.commenting_disabled_reason_for_idea(idea, user)).to eq 'project_inactive'
      end

      it "returns 'project_inactive' when the project is archived" do
        project = create(:project_with_current_phase, with_permissions: true, admin_publication_attributes: {publication_status: 'archived'})
        expect(service.commenting_idea_disabled_reason_for_project(project, user)).to eq 'project_inactive'
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.commenting_disabled_reason_for_idea(idea, user)).to eq 'project_inactive'
      end

      it "returns nil when we're in a participatory budgeting context" do
        project = create(:project_with_current_phase, 
          with_permissions: true, 
          current_phase_attrs: {participation_method: 'budgeting', max_budget: 1200}
          )
        expect(service.commenting_idea_disabled_reason_for_project(project, user)).to eq nil
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.commenting_disabled_reason_for_idea(idea, user)).to eq nil
      end

      it "returns 'idea_not_in_current_phase' for an idea when it's not in the current phase" do
        project = create(:project_with_current_phase, with_permissions: true,
          current_phase_attrs: {participation_method: 'information'})
        idea = create(:idea, project: project, phases: [project.phases[1]])
        expect(service.commenting_disabled_reason_for_idea(idea, user)).to eq 'idea_not_in_current_phase'
      end
    end

    context " for continuous project" do
      it "returns 'commenting_disabled' when commenting is disabled in a continuous project" do
        project = create(:continuous_project, commenting_enabled: false)
        expect(service.commenting_idea_disabled_reason_for_project(project, create(:user))).to eq 'commenting_disabled'
        idea = create(:idea, project: project)
        expect(service.commenting_disabled_reason_for_idea(idea, user)).to eq 'commenting_disabled'
      end

      it "returns 'not_permitted' when commenting is disabled in a continuous project" do
        project = create(:continuous_project, with_permissions: true)
        permission = project.permissions.find_by(action: 'commenting_idea')
        permission.update!(permitted_by: 'groups', 
          group_ids: create_list(:group, 2).map(&:id)
          )
        expect(service.commenting_idea_disabled_reason_for_project(project, create(:user))).to eq 'not_permitted'
        idea = create(:idea, project: project)
        expect(service.commenting_disabled_reason_for_idea(idea, user)).to eq 'not_permitted'
      end

      it "returns nil when commenting is permitted in a continuous project" do
        project = create(:continuous_project, with_permissions: true)
        expect(service.commenting_idea_disabled_reason_for_project(project, create(:user))).to be_nil
        idea = create(:idea, project: project)
        expect(service.commenting_disabled_reason_for_idea(idea, user)).to be_nil
      end

      it "returns not_supported when in a survey project" do
        project = create(:continuous_survey_project, with_permissions: true)
        expect(service.commenting_idea_disabled_reason_for_project(project, create(:user))).to eq 'not_supported'
      end

      it "returns 'project_inactive' when the project is archived" do
        project = create(:continuous_project, admin_publication_attributes: {publication_status: 'archived'})
        expect(service.commenting_idea_disabled_reason_for_project(project, create(:user))).to eq 'project_inactive'
        idea = create(:idea, project: project)
        expect(service.commenting_disabled_reason_for_idea(idea, user)).to eq 'project_inactive'
      end
    end
  end


  describe "voting_disabled_reasons" do

    let(:user) { create(:user) }
    let(:reasons) { ParticipationContextService::VOTING_DISABLED_REASONS }

    context "timeline project" do
      it "returns nil when voting is enabled in the current phase with unlimited voting" do
        project = create(:project_with_current_phase, with_permissions: true)
        expect(service.voting_idea_disabled_reason_for_project(project, user)).to be_nil
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.voting_disabled_reason_for_idea(idea, user)).to be_nil
      end

      it "returns `idea_not_in_current_phase` when it's not in the current phase" do
        project = create(:project_with_current_phase, with_permissions: true)
        expect(service.voting_idea_disabled_reason_for_project(project, user)).to be_nil
        idea = create(:idea, project: project, phases: [project.phases[1]])
        expect(service.voting_disabled_reason_for_idea(idea, user)).to eq 'idea_not_in_current_phase'
      end

      it "returns 'voting_disabled' if it's in the current phase and voting is disabled" do
        project = create(:project_with_current_phase, current_phase_attrs: {voting_enabled: false})
        expect(service.voting_idea_disabled_reason_for_project(project, user)).to eq 'voting_disabled'
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.voting_disabled_reason_for_idea(idea, user)).to eq 'voting_disabled'
      end

      it "returns `not_signed_in` when user needs to be signed in" do
        project = create(:project_with_current_phase, with_permissions: true)
        idea = create(:idea, project: project, phases: [project.phases[2]])
        permission = service.get_participation_context(project).permissions.find_by(action: 'voting_idea')
        permission.update!(permitted_by: 'users')
        expect(service.voting_idea_disabled_reason_for_project(project, nil)).to eq 'not_signed_in'
        expect(service.voting_disabled_reason_for_idea(idea, nil)).to eq 'not_signed_in'
      end

      it "returns 'not_permitted' if it's in the current phase and voting is not permitted" do
        project = create(:project_with_current_phase, with_permissions: true)
        idea = create(:idea, project: project, phases: [project.phases[2]])
        permission = service.get_participation_context(project).permissions.find_by(action: 'voting_idea')
        permission.update!(permitted_by: 'groups', 
          group_ids: create_list(:group, 2).map(&:id)
          )
        expect(service.voting_idea_disabled_reason_for_project(project, user)).to eq 'not_permitted'
        expect(service.voting_disabled_reason_for_idea(idea, user)).to eq 'not_permitted'
      end

      it "returns `voting_limited_max_reached` when it's in the current phase and the user reached his limit" do
        project = create(:project_with_current_phase, with_permissions: true, current_phase_attrs: {
          voting_method: 'limited', 
          voting_limited_max: 3
        })
        phase = project.phases[2]
        ideas = create_list(:idea, 3, project: project, phases: [phase])
        ideas.each{|idea| create(:vote, votable: idea, user: user)}
        idea = create(:idea, project: project, phases: [phase])
        expect(service.voting_idea_disabled_reason_for_project(project, user)).to eq 'voting_limited_max_reached'
        expect(service.voting_disabled_reason_for_idea(idea, user)).to eq 'voting_limited_max_reached'
      end

      it "returns 'project_inactive' when the timeline has past" do
        project = create(:project_with_past_phases, with_permissions: true)
        expect(service.voting_idea_disabled_reason_for_project(project, user)).to eq 'project_inactive'
        idea = create(:idea, project: project, phases: project.phases)
        expect(service.voting_disabled_reason_for_idea(idea, user)).to eq 'project_inactive'
      end

      it "returns `not_ideation` when we're in a participatory budgeting context" do
        project = create(:project_with_current_phase, 
          with_permissions: true, 
          current_phase_attrs: {participation_method: 'budgeting', max_budget: 1200}
          )
        expect(service.voting_idea_disabled_reason_for_project(project, user)).to eq 'not_ideation'
        idea = create(:idea, project: project, phases: project.phases)
        expect(service.voting_disabled_reason_for_idea(idea, user)).to eq 'not_ideation'
      end
    end

    context "continuous project" do
      context "for a normal user" do
        let(:user) { create(:user) }
        it "returns nil when voting is enabled in the current project with unlimited voting" do
          project = create(:continuous_project, with_permissions: true)
          expect(service.voting_idea_disabled_reason_for_project(project, user)).to be_nil
          idea = create(:idea, project: project)
          expect(service.voting_disabled_reason_for_idea(idea, user)).to be_nil
        end

        it "returns 'voting_disabled' if voting is disabled" do
          project = create(:continuous_project, voting_enabled: false)
          expect(service.voting_idea_disabled_reason_for_project(project, user)).to eq 'voting_disabled'
          idea = create(:idea, project: project)
          expect(service.voting_disabled_reason_for_idea(idea, user)).to eq 'voting_disabled'
        end

        it "returns 'not_permitted' if voting is not permitted" do
          project = create(:continuous_project, with_permissions: true)
          idea = create(:idea, project: project)
          permission = project.permissions.find_by(action: 'voting_idea')
          permission.update!(permitted_by: 'groups', 
            group_ids: create_list(:group, 2).map(&:id)
            )
          expect(service.voting_idea_disabled_reason_for_project(project, user)).to eq 'not_permitted'
          expect(service.voting_disabled_reason_for_idea(idea, user)).to eq 'not_permitted'
        end

        it "returns 'voting_limited_max_reached' when the user reached his limit" do
          project = create(:continuous_project, 
            voting_method: 'limited', voting_limited_max: 3, 
            with_permissions: true
            )
          ideas = create_list(:idea, 3, project: project)
          ideas.each{|idea| create(:vote, votable: idea, user: user)}
          idea = create(:idea, project: project)
          expect(service.voting_idea_disabled_reason_for_project(project, user)).to eq 'voting_limited_max_reached'
          expect(service.voting_disabled_reason_for_idea(idea, user)).to eq 'voting_limited_max_reached'
        end

        it "returns 'project_inactive' when the project is archived" do
          project = create(:continuous_project, with_permissions: true, admin_publication_attributes: {publication_status: 'archived'})
          expect(service.voting_idea_disabled_reason_for_project(project, user)).to eq 'project_inactive'
          idea = create(:idea, project: project)
          expect(service.voting_disabled_reason_for_idea(idea, user)).to eq 'project_inactive'
        end
      end
      context "for an unauthenticated visitor" do
        let(:user) { nil }

        it "returns 'not_permitted' if voting is not permitted and verification is not involved" do
          project = create(:continuous_project, with_permissions: true)
          idea = create(:idea, project: project)
          permission = project.permissions.find_by(action: 'voting_idea')
          permission.update!(permitted_by: 'groups', 
            group_ids: create_list(:group, 2).map(&:id)
            )
          expect(service.voting_idea_disabled_reason_for_project(project, user)).to eq 'not_permitted'
          expect(service.voting_disabled_reason_for_idea(idea, user)).to eq 'not_permitted'
        end
      end
    end
  end

  describe "cancelling_votes_disabled_reasons" do

    let(:user) { create(:user) }
    let(:reasons) { ParticipationContextService::VOTING_DISABLED_REASONS }

    context "timeline project" do
      it "returns nil when voting is enabled in the current phase" do
        project = create(:project_with_current_phase, with_permissions: true)
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.cancelling_votes_disabled_reason_for_idea(idea, idea.author)).to be_nil
      end

      it "returns `idea_not_in_current_phase` when it's not in the current phase" do
        project = create(:project_with_current_phase, with_permissions: true)
        idea = create(:idea, project: project, phases: [project.phases[1]])
        expect(service.cancelling_votes_disabled_reason_for_idea(idea, idea.author)).to eq reasons[:idea_not_in_current_phase]
      end

      it "returns 'voting_disabled' if it's in the current phase and voting is disabled" do
        project = create(:project_with_current_phase, current_phase_attrs: {voting_enabled: false})
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.cancelling_votes_disabled_reason_for_idea(idea, idea.author)).to eq reasons[:voting_disabled]
      end

      it "returns `not_signed_in` if it's in the current phase and user needs to be signed in" do
        project = create(:project_with_current_phase, 
          with_permissions: true, 
          current_phase_attrs: {voting_idea_permitted: false} 
          )
        idea = create(:idea, project: project, phases: [project.phases[2]])
        permission = service.get_participation_context(project).permissions.find_by(action: 'voting_idea')
        permission.update!(permitted_by: 'users')
        expect(service.cancelling_votes_disabled_reason_for_idea(idea, nil)).to eq 'not_signed_in'
      end

      it "returns 'not_permitted' if it's in the current phase and voting is not permitted" do
        project = create(:project_with_current_phase, 
          with_permissions: true, 
          current_phase_attrs: {voting_idea_permitted: false} 
          )
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.cancelling_votes_disabled_reason_for_idea(idea, idea.author)).to eq reasons[:not_permitted]
      end

      it "returns 'project_inactive' when the timeline has past" do
        project = create(:project_with_past_phases, with_permissions: true)
        idea = create(:idea, project: project, phases: project.phases)
        expect(service.cancelling_votes_disabled_reason_for_idea(idea, idea.author)).to eq reasons[:project_inactive]
      end

      it "returns `not_ideation` when we're in a participatory budgeting context" do
        project = create(:project_with_current_phase, 
          with_permissions: true, 
          current_phase_attrs: {participation_method: 'budgeting', max_budget: 1200}
          )
        idea = create(:idea, project: project, phases: project.phases)
        expect(service.cancelling_votes_disabled_reason_for_idea(idea, idea.author)).to eq 'not_ideation'
      end
    end

    context "continuous project" do
      it "returns nil when voting is enabled in the current project with unlimited voting" do
        project = create(:continuous_project, with_permissions: true)
        idea = create(:idea, project: project)
        expect(service.cancelling_votes_disabled_reason_for_idea(idea, idea.author)).to be_nil
      end

      it "returns 'voting_disabled' if voting is disabled" do
        project = create(:continuous_project, voting_enabled: false)
        idea = create(:idea, project: project)
        expect(service.cancelling_votes_disabled_reason_for_idea(idea, idea.author)).to eq reasons[:voting_disabled]
      end

      it "returns 'not_permitted' if voting is not permitted" do
        project = create(:continuous_project, with_permissions: true)
        idea = create(:idea, project: project)
        permission = project.permissions.find_by(action: 'voting_idea')
        permission.update!(permitted_by: 'groups', 
          group_ids: create_list(:group, 2).map(&:id)
          )
        expect(service.cancelling_votes_disabled_reason_for_idea(idea, idea.author)).to eq reasons[:not_permitted]
      end

      it "returns 'project_inactive' when the project is archived" do
        project = create(:continuous_project, admin_publication_attributes: {publication_status: 'archived'})
        idea = create(:idea, project: project, phases: project.phases)
        expect(service.cancelling_votes_disabled_reason_for_idea(idea, idea.author)).to eq reasons[:project_inactive]
      end
    end
  end

  describe "taking_survey_disabled_reason" do
    it "returns nil when taking the survey is allowed" do
      project = create(:continuous_survey_project, with_permissions: true)
      permission = service.get_participation_context(project).permissions.find_by(action: 'taking_survey')
      groups = create_list(:group, 2, projects: [project])
      permission.update!(permitted_by: 'groups', group_ids: groups.map(&:id))
      user = create(:user)
      group = groups.first
      group.add_member user
      group.save!
      expect(service.taking_survey_disabled_reason_for_project(project, user)).to be_nil
    end

    it "returns `not_signed_in` when user needs to be signed in" do
      project = create(:continuous_survey_project, with_permissions: true)
      permission = service.get_participation_context(project).permissions.find_by(action: 'taking_survey')
      permission.update!(permitted_by: 'users')
      expect(service.taking_survey_disabled_reason_for_project(project, nil)).to eq 'not_signed_in'
    end

    it "returns `not_permitted` when taking the survey is not permitted" do
      project = create(:continuous_survey_project, with_permissions: true)
      permission = service.get_participation_context(project).permissions.find_by(action: 'taking_survey')
      permission.update!(permitted_by: 'groups', 
        group_ids: create_list(:group, 2).map(&:id)
        )
      expect(service.taking_survey_disabled_reason_for_project(project, create(:user))).to eq 'not_permitted'
    end

    it "returns `not_survey` when the active context is not a survey" do
      project = create(:project_with_current_phase, 
        with_permissions: true, 
        current_phase_attrs: {participation_method: 'ideation'}
        )
      expect(service.taking_survey_disabled_reason_for_project(project, create(:user))).to eq 'not_survey'
    end

    it "returns `project_inactive` when the timeline has past" do
      project = create(:project_with_past_phases, with_permissions: true)
      expect(service.taking_survey_disabled_reason_for_project(project, create(:user))).to eq 'project_inactive'
    end

    it "returns `project_inactive` when the continuous project is archived" do
      project = create(:continuous_project, with_permissions: true, admin_publication_attributes: {publication_status: 'archived'})
      expect(service.taking_survey_disabled_reason_for_project(project, create(:user))).to eq 'project_inactive'
    end
  end

  describe "taking_poll_disabled_reason" do
    it "returns nil when taking the poll is allowed" do
      project = create(:continuous_poll_project, with_permissions: true)
      permission = Permission.find_by(action: 'taking_poll', permission_scope: project)
      group = create(:group, projects: [project])
      permission.update!(permitted_by: 'groups', groups: [group])
      user = create(:user)
      group.add_member(user)
      group.save!
      expect(service.taking_poll_disabled_reason_for_project(project, user)).to be_nil
    end

    it "returns `not_signed_in` when user needs to be signed in" do
      project = create(:continuous_poll_project, with_permissions: true)
      permission = service.get_participation_context(project).permissions.find_by(action: 'taking_poll')
      permission.update!(permitted_by: 'users')
      expect(service.taking_poll_disabled_reason_for_project(project, nil)).to eq 'not_signed_in'
    end

    it "return `not_permitted` when taking the poll is not permitted" do
      project = create(:continuous_poll_project, with_permissions: true)
      permission = service.get_participation_context(project).permissions.find_by(action: 'taking_poll')
      permission.update!(permitted_by: 'admins_moderators')
      expect(service.taking_poll_disabled_reason_for_project(project, create(:user))).to eq 'not_permitted'
    end

    it "returns `not_poll` when the active context is not a poll" do
      project = create(:project_with_current_phase, 
        with_permissions: true, 
        current_phase_attrs: {participation_method: 'information'}
        )
      expect(service.taking_poll_disabled_reason_for_project(project, create(:user))).to eq 'not_poll'
    end

    it "returns `already_responded` when the user already responded to the poll before" do
      project = create(:continuous_poll_project, with_permissions: true)
      poll_response = create(:poll_response, participation_context: project)
      user = poll_response.user
      expect(service.taking_poll_disabled_reason_for_project(project, user)).to eq 'already_responded'
    end

    it "returns `project_inactive` when the timeline has past" do
      project = create(:project_with_past_phases, with_permissions: true)
      expect(service.taking_poll_disabled_reason_for_project(project, create(:user))).to eq 'project_inactive'
    end

    it "returns `project_inactive` when the continuous project is archived" do
      project = create(:continuous_project, with_permissions: true, admin_publication_attributes: {publication_status: 'archived'})
      expect(service.taking_poll_disabled_reason_for_project(project, create(:user))).to eq 'project_inactive'
    end
  end

  describe "budgeting_disabled_reasons" do

    context "for timeline projects" do
      it "returns nil when the idea is in the current phase and budgeting is allowed" do
        project = create(:project_with_current_phase, with_permissions: true, phases_config: {
          sequence: 'xxcxx'
        }, current_phase_attrs: {participation_method: 'budgeting', max_budget: 10000})
        idea = create(:idea, project: project, phases: [project.phases[2]] )
        expect(service.budgeting_disabled_reason_for_idea(idea, create(:user))).to be_nil
      end

      it "returns `idea_not_in_current_phase` when the idea is not in the current phase, budgeting is allowed in the current phase and was allowed in the last phase the idea was part of" do
        project = create(:project_with_current_phase, with_permissions: true, phases_config: {
          sequence: "xxcxx"
        }, current_phase_attrs: {participation_method: 'budgeting', max_budget: 10000})
        idea = create(:idea, project: project, phases: [project.phases[1]])
        expect(service.budgeting_disabled_reason_for_idea(idea, create(:user))).to eq 'idea_not_in_current_phase'
      end

      it "returns `not_signed_in` when user needs to be signed in" do
        project = create(:project_with_current_phase, with_permissions: true,
          current_phase_attrs: {participation_method: 'budgeting', max_budget: 10000})
        idea = create(:idea, project: project, phases: [project.phases[2]])
        permission = service.get_participation_context(project).permissions.find_by(action: 'budgeting')
        permission.update!(permitted_by: 'users')
        expect(service.budgeting_disabled_reason_for_idea(idea, nil)).to eq 'not_signed_in'
      end

      it "returns `not_permitted` when the idea is in the current phase and budgeting is not permitted" do
        project = create(:project_with_current_phase, with_permissions: true,
          current_phase_attrs: {participation_method: 'budgeting', max_budget: 10000})
        idea = create(:idea, project: project, phases: [project.phases[2]])
        permission = service.get_participation_context(project).permissions.find_by(action: 'budgeting')
        permission.update!(permitted_by: 'groups', 
          group_ids: create_list(:group, 2).map(&:id)
          )
        expect(service.budgeting_disabled_reason_for_idea(idea, create(:user))).to eq 'not_permitted'
      end

      it "returns 'idea_not_in_current_phase' when the idea is not in the current phase, budgeting is permitted but was not permitted in the last phase the idea was part of" do
        project = create(:project_with_current_phase, with_permissions: true, 
          current_phase_attrs: {participation_method: 'budgeting', max_budget: 10000})
        phase = project.phases[1]
        permission = phase.permissions.find_by(action: 'budgeting')
        if permission
          permission.update!(permitted_by: 'groups', 
            group_ids: create_list(:group, 2).map(&:id)
            )
        end
        idea = create(:idea, project: project, phases: [project.phases[0], project.phases[1]])
        expect(service.budgeting_disabled_reason_for_idea(idea, create(:user))).to eq 'idea_not_in_current_phase'
      end

      it "returns 'project_inactive' when the timeline is over" do
        project = create(:project_with_past_phases, with_permissions: true)
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.budgeting_disabled_reason_for_idea(idea, create(:user))).to eq 'project_inactive'
      end
    end

    context "continuous project" do
      it "returns 'not_permitted' when budgeting is disabled in a continuous project" do
        project = create(:continuous_budgeting_project, with_permissions: true)
        permission = project.permissions.find_by(action: 'budgeting')
        permission.update!(permitted_by: 'groups', 
          group_ids: create_list(:group, 2).map(&:id)
          )
        idea = create(:idea, project: project)
        expect(service.budgeting_disabled_reason_for_idea(idea, create(:user))).to eq 'not_permitted'
      end

      it "returns nil when budgeting is permitted in a continuous project" do
        project = create(:continuous_budgeting_project, with_permissions: true)
        idea = create(:idea, project: project)
        expect(service.budgeting_disabled_reason_for_idea(idea, create(:user))).to be_nil
      end

      it "returns 'project_inactive' when the project is archived" do
        project = create(:continuous_budgeting_project, admin_publication_attributes: {publication_status: 'archived'})
        idea = create(:idea, project: project)
        expect(service.budgeting_disabled_reason_for_idea(idea, create(:user))).to eq 'project_inactive'
      end
    end
  end

  describe "future_posting_enabled_phase" do
    it "returns the first upcoming phase that has posting enabled" do
      project = create(:project_with_current_phase, with_permissions: true, 
        phases_config: {
          sequence: "xcxxxxxy",
          x: {posting_enabled: false},
          y: {posting_enabled: true},
          c: {posting_enabled: false}
        }
      )
      expect(service.future_posting_idea_enabled_phase(project, create(:user))).to eq project.phases.order(:start_at)[7]
    end

    it "returns the first upcoming phase that has posting enabled" do
      project = create(:project_with_current_phase, with_permissions: true, 
        phases_config: {
          sequence: "xcxxxxxy",
          x: {posting_idea_permitted: false},
          y: {posting_idea_permitted: true},
          c: {posting_idea_permitted: false}
        }
      )
      expect(service.future_posting_idea_enabled_phase(project, create(:user))).to eq project.phases.order(:start_at)[7]
    end

    it "returns nil if no next phase has posting enabled" do
      project = create(:project_with_current_phase, with_permissions: true, 
        phases_config: {
          sequence: "xcyyy",
          y: {posting_idea_permitted: false},
        }
      )
      expect(service.future_posting_idea_enabled_phase(project, create(:user))).to be_nil
    end

    it "returns nil if no next phase has posting enabled" do
      project = create(:project_with_current_phase, with_permissions: true, 
        phases_config: {
          sequence: "xcyyy",
          y: {posting_enabled: false},
        }
      )
      expect(service.future_posting_idea_enabled_phase(project, create(:user))).to be_nil
    end

    it "returns nil for a continuous project" do
      project = create(:continuous_project, with_permissions: true)
      expect(service.future_posting_idea_enabled_phase(project, create(:user))).to be_nil
    end

    it "returns nil for a project without future phases" do
      project = create(:project_with_past_phases, with_permissions: true)
      expect(service.future_posting_idea_enabled_phase(project, create(:user))).to be_nil
    end
  end

  describe "future_voting_enabled_phase" do
    it "returns the first upcoming phase that has voting enabled" do
      project = create(:project_with_current_phase, with_permissions: true, 
        phases_config: {
          sequence: "xcxxxxxy",
          x: {voting_enabled: false},
          y: {voting_enabled: true},
          c: {voting_enabled: false}
        }
      )
      expect(service.future_voting_idea_enabled_phase(project, create(:user))).to eq project.phases.order(:start_at)[7]
    end

    it "returns the first upcoming phase that has voting enabled" do
      project = create(:project_with_current_phase, with_permissions: true, 
        phases_config: {
          sequence: "xcxxxxxy",
          x: {voting_idea_permitted: false},
          y: {voting_idea_permitted: true},
          c: {voting_idea_permitted: false}
        }
      )
      expect(service.future_voting_idea_enabled_phase(project, create(:user))).to eq project.phases.order(:start_at)[7]
    end

    it "returns nil if no next phase has voting enabled" do
      project = create(:project_with_current_phase, with_permissions: true, 
        phases_config: {
          sequence: "xcyyy",
          y: {voting_enabled: false},
        }
      )
      expect(service.future_voting_idea_enabled_phase(project, create(:user))).to be_nil
    end

    it "returns nil if no next phase has voting enabled" do
      project = create(:project_with_current_phase, with_permissions: true, 
        phases_config: {
          sequence: "xcyyy",
          y: {voting_idea_permitted: false},
        }
      )
      expect(service.future_voting_idea_enabled_phase(project, create(:user))).to be_nil
    end

    it "returns nil for a continuous project" do
      project = create(:continuous_project, with_permissions: true)
      expect(service.future_voting_idea_enabled_phase(project, create(:user))).to be_nil
    end

    it "returns nil for a project without future phases" do
      project = create(:project_with_past_phases, with_permissions: true)
      expect(service.future_voting_idea_enabled_phase(project, create(:user))).to be_nil
    end
  end

  describe "future_commenting_enabled_phase" do
    it "returns the first upcoming phase that has commenting enabled" do
      project = create(:project_with_current_phase, with_permissions: true, 
        phases_config: {
          sequence: "xcxxxxxy",
          x: {commenting_enabled: false},
          y: {commenting_enabled: true},
          c: {commenting_enabled: false}
        }
      )
      expect(service.future_commenting_idea_enabled_phase(project, create(:user))).to eq project.phases.order(:start_at)[7]
    end

    it "returns the first upcoming phase that has commenting enabled" do
      project = create(:project_with_current_phase, with_permissions: true, 
        phases_config: {
          sequence: "xcxxxxxy",
          x: {commenting_idea_permitted: false},
          y: {commenting_idea_permitted: true},
          c: {commenting_idea_permitted: false}
        }
      )
      expect(service.future_commenting_idea_enabled_phase(project, create(:user))).to eq project.phases.order(:start_at)[7]
    end

    it "returns nil if no next phase has commenting enabled" do
      project = create(:project_with_current_phase, with_permissions: true, 
        phases_config: {
          sequence: "xcyyy",
          y: {commenting_enabled: false},
        }
      )
      expect(service.future_commenting_idea_enabled_phase(project, create(:user))).to be_nil
    end

    it "returns nil if no next phase has commenting enabled" do
      project = create(:project_with_current_phase, with_permissions: true, 
        phases_config: {
          sequence: "xcyyy",
          y: {commenting_idea_permitted: false},
        }
      )
      expect(service.future_commenting_idea_enabled_phase(project, create(:user))).to be_nil
    end

    it "returns nil for a continuous project" do
      project = create(:continuous_project, with_permissions: true)
      expect(service.future_commenting_idea_enabled_phase(project, create(:user))).to be_nil
    end

    it "returns nil for a project without future phases" do
      project = create(:project_with_past_phases, with_permissions: true)
      expect(service.future_commenting_idea_enabled_phase(project, create(:user))).to be_nil
    end
  end
end