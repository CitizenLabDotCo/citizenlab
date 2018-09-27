require "rails_helper"

describe ParticipationContextService do
  let(:service) { ParticipationContextService.new }

  describe "get_participation_context" do

    it "returns the project for a continuous project" do
      project = build(:continuous_project)
      expect(service.get_participation_context(project)).to eq project
    end

    it "returns the active phase for a timeline project" do
      random_title = SecureRandom.uuid
      project = create(:project_with_current_phase, current_phase_attrs: {title_multiloc: {'en' => random_title} })
      expect(service.get_participation_context(project)&.title_multiloc.dig('en')).to eq random_title
    end

    it "returns nil for a timeline project without an active phase" do
      project = create(:project_with_past_phases)
      expect(service.get_participation_context(project)).to eq nil
    end
  end

  describe "posting_disabled_reason" do
    it "returns nil when posting is allowed" do
      project = create(:project_with_current_phase, with_permissions: true)
      phase = service.get_participation_context project
      permission = phase.permissions.where(action: 'posting').first
      groups = create_list(:group, 2, projects: [project])
      permission.update!(permitted_by: 'groups', group_ids: groups.map(&:id))
      user = create(:user)
      group = groups.first
      group.add_member user
      group.save!
      expect(service.posting_disabled_reason(project, user)).to be_nil
    end

    it "returns `not_permitted` when posting is not permitted" do
      project = create(:project_with_current_phase, with_permissions: true)
      phase = service.get_participation_context project
      permission = phase.permissions.where(action: 'posting').first
      permission.update!(permitted_by: 'groups', group_ids: create_list(:group, 2, projects: [project]).map(&:id))
      expect(service.posting_disabled_reason(project, create(:user))).to eq 'not_permitted'
    end

    it "return `not_ideation` when we're not in an ideation context" do
      project = create(:project_with_current_phase, with_permissions: true, current_phase_attrs: {participation_method: 'information'})
      expect(service.posting_disabled_reason(project, create(:user))).to eq 'not_ideation'
    end

    it "returns `project_inactive` when we're not in an active context" do
      project = create(:project_with_past_phases, with_permissions: true)
      expect(service.posting_disabled_reason(project, create(:user))).to eq 'project_inactive'
    end
  end

  describe "commenting_disabled_reasons" do

    context "for timeline projects" do
      it "returns nil when the idea is in the current phase and commenting is allowed" do
        project = create(:project_with_current_phase, with_permissions: true, phases_config: {
          sequence: 'xxcxx'
        })
        idea = create(:idea, project: project, phases: [project.phases[2]] )
        expect(service.commenting_disabled_reason(idea, create(:user))).to be_nil
      end

      it "returns nil when the idea is not in the current phase, commenting is allowed in the current phase and was allowed in the last phase the idea was part of" do
        project = create(:project_with_current_phase, with_permissions: true, phases_config: {
          sequence: "xxcxx"
        })
        idea = create(:idea, project: project, phases: [project.phases[1]])
        expect(service.commenting_disabled_reason(idea, create(:user))).to be_nil
      end

      it "returns `not_permitted` when the idea is in the current phase and commenting is not permitted" do
        project = create(:project_with_current_phase, with_permissions: true)
        idea = create(:idea, project: project, phases: [project.phases[2]])
        phase = service.get_participation_context project
        permission = phase.permissions.where(action: 'commenting').first
        permission.update!(permitted_by: 'groups', group_ids: create_list(:group, 2, projects: [project]).map(&:id))
        expect(service.commenting_disabled_reason(idea, create(:user))).to eq 'not_permitted'
      end

      it "returns 'not_permitted' when the idea is not in the current phase, commenting is permitted but was not permitted in the last phase the idea was part of" do
        project = create(:project_with_current_phase, with_permissions: true)
        phase = project.phases[1]
        permission = phase.permissions.where(action: 'commenting').first
        permission.update!(permitted_by: 'groups', group_ids: create_list(:group, 2, projects: [project]).map(&:id))
        idea = create(:idea, project: project, phases: [project.phases[0], project.phases[1]])
        expect(service.commenting_disabled_reason(idea, create(:user))).to eq 'not_permitted'
      end

      it "returns 'project_inactive' when the timeline is over" do
        project = create(:project_with_past_phases, with_permissions: true)
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.commenting_disabled_reason(idea, create(:user))).to eq 'project_inactive'
      end
    end

    context "continuous project" do
      it "returns 'not_permitted' when commenting is disabled in a continuous project" do
        project = create(:continuous_project, with_permissions: true)
        permission = project.permissions.where(action: 'commenting').first
        permission.update!(permitted_by: 'groups', group_ids: create_list(:group, 2, projects: [project]).map(&:id))
        idea = create(:idea, project: project)
        expect(service.commenting_disabled_reason(idea, create(:user))).to eq 'not_permitted'
      end

      it "returns nil when commenting is enabled in a continuous project" do
        project = create(:continuous_project, commenting_enabled: true, with_permissions: true)
        idea = create(:idea, project: project)
        expect(service.commenting_disabled_reason(idea, create(:user))).to be_nil
      end
    end
  end


  describe "voting_disabled_reasons" do

    let(:user) { create(:user) }
    let(:reasons) { ParticipationContextService::VOTING_DISABLED_REASONS }

    context "timeline project" do
      it "returns nil when voting is enabled in the current phase with unlimited voting" do
        project = create(:project_with_current_phase, with_permissions: true)
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.voting_disabled_reason(idea, user)).to be_nil
      end

      it "returns `not_in_active_context` when it's not in the current phase" do
        project = create(:project_with_current_phase, with_permissions: true)
        idea = create(:idea, project: project, phases: [project.phases[1]])
        expect(service.voting_disabled_reason(idea, user)).to eq reasons[:not_in_active_context]
      end

      it "returns 'voting_disabled' if it's in the current phase and voting is disabled" do
        project = create(:project_with_current_phase, current_phase_attrs: {voting_enabled: false}, with_permissions: true)
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.voting_disabled_reason(idea, user)).to eq reasons[:voting_disabled]
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
        expect(service.voting_disabled_reason(idea, user)).to eq reasons[:voting_limited_max_reached]
      end

      it "returns 'project_inactive' when the timeline has past" do
        project = create(:project_with_past_phases, with_permissions: true)
        idea = create(:idea, project: project, phases: project.phases)
        expect(service.voting_disabled_reason(idea, user)).to eq reasons[:project_inactive]
      end
    end

    context "continuous project" do
      it "returns nil when voting is enabled in the current project with unlimited voting" do
        project = create(:continuous_project, with_permissions: true)
        idea = create(:idea, project: project)
        expect(service.voting_disabled_reason(idea, user)).to be_nil
      end

      it "returns 'voting_disabled' if voting is disabled" do
        project = create(:continuous_project, voting_enabled: false, with_permissions: true)
        idea = create(:idea, project: project)
        expect(service.voting_disabled_reason(idea, user)).to eq reasons[:voting_disabled]
      end

      it "returns 'voting_limited_max_reached' when the user reached his limit" do
        project = create(:continuous_project, voting_method: 'limited', voting_limited_max: 3, with_permissions: true)
        ideas = create_list(:idea, 3, project: project)
        ideas.each{|idea| create(:vote, votable: idea, user: user)}
        idea = create(:idea, project: project)
        expect(service.voting_disabled_reason(idea, user)).to eq reasons[:voting_limited_max_reached]
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
        expect(service.cancelling_votes_disabled_reason(idea, idea.author)).to be_nil
      end

      it "returns `not_in_active_context` when it's not in the current phase" do
        project = create(:project_with_current_phase, with_permissions: true)
        idea = create(:idea, project: project, phases: [project.phases[1]])
        expect(service.cancelling_votes_disabled_reason(idea, idea.author)).to eq reasons[:not_in_active_context]
      end

      it "returns 'voting_disabled' if it's in the current phase and voting is disabled" do
        project = create(:project_with_current_phase, current_phase_attrs: {voting_enabled: false}, with_permissions: true)
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.cancelling_votes_disabled_reason(idea, idea.author)).to eq reasons[:voting_disabled]
      end

      it "returns 'project_inactive' when the timeline has past" do
        project = create(:project_with_past_phases, with_permissions: true)
        idea = create(:idea, project: project, phases: project.phases)
        expect(service.cancelling_votes_disabled_reason(idea, idea.author)).to eq reasons[:project_inactive]
      end
    end

    context "continuous project" do
      it "returns nil when voting is enabled in the current project with unlimited voting" do
        project = create(:continuous_project, with_permissions: true)
        idea = create(:idea, project: project)
        expect(service.cancelling_votes_disabled_reason(idea, idea.author)).to be_nil
      end

      it "returns 'voting_disabled' if voting is disabled" do
        project = create(:continuous_project, voting_enabled: false, with_permissions: true)
        idea = create(:idea, project: project)
        expect(service.cancelling_votes_disabled_reason(idea, idea.author)).to eq reasons[:voting_disabled]
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
      expect(service.future_posting_enabled_phase(project, create(:user))).to eq project.phases[7]
    end

    it "returns nil if no next phase has posting enabled" do
      project = create(:project_with_current_phase, with_permissions: true, 
        phases_config: {
          sequence: "xcyyy",
          y: {posting_enabled: false},
        }
      )
      expect(service.future_posting_enabled_phase(project, create(:user))).to be_nil
    end

    it "returns nil for a continuous project" do
      project = create(:continuous_project, with_permissions: true)
      expect(service.future_posting_enabled_phase(project, create(:user))).to be_nil
    end

    it "returns nil for a project without future phases" do
      project = create(:project_with_past_phases, with_permissions: true)
      expect(service.future_posting_enabled_phase(project, create(:user))).to be_nil
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
      expect(service.future_voting_enabled_phase(project, create(:user))).to eq project.phases[7]
    end

    it "returns nil if no next phase has voting enabled" do
      project = create(:project_with_current_phase, with_permissions: true, 
        phases_config: {
          sequence: "xcyyy",
          y: {voting_enabled: false},
        }
      )
      expect(service.future_voting_enabled_phase(project, create(:user))).to be_nil
    end

    it "returns nil for a continuous project" do
      project = create(:continuous_project, with_permissions: true)
      expect(service.future_voting_enabled_phase(project, create(:user))).to be_nil
    end

    it "returns nil for a project without future phases" do
      project = create(:project_with_past_phases, with_permissions: true)
      expect(service.future_voting_enabled_phase(project, create(:user))).to be_nil
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
      expect(service.future_commenting_enabled_phase(project, create(:user))).to eq project.phases[7]
    end

    it "returns nil if no next phase has commenting enabled" do
      project = create(:project_with_current_phase, with_permissions: true, 
        phases_config: {
          sequence: "xcyyy",
          y: {commenting_enabled: false},
        }
      )
      expect(service.future_commenting_enabled_phase(project, create(:user))).to be_nil
    end

    it "returns nil for a continuous project" do
      project = create(:continuous_project, with_permissions: true)
      expect(service.future_commenting_enabled_phase(project, create(:user))).to be_nil
    end

    it "returns nil for a project without future phases" do
      project = create(:project_with_past_phases, with_permissions: true)
      expect(service.future_commenting_enabled_phase(project, create(:user))).to be_nil
    end
  end
end