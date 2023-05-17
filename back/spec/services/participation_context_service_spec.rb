# frozen_string_literal: true

require 'rails_helper'

describe ParticipationContextService do
  let(:service) { described_class.new }

  describe 'participation_possible_for_context?' do
    let(:no_participation_attributes) do
      {
        participation_method: 'ideation',
        posting_enabled: false,
        voting_enabled: false,
        commenting_enabled: false
      }
    end

    it 'returns true when posting is possible' do
      expect(service).to receive(:posting_idea_disabled_reason_for_context).and_return nil
      project = create(:continuous_project, no_participation_attributes)
      expect(service.participation_possible_for_context?(project, create(:user))).to be true
    end

    it 'returns true when commenting is possible' do
      expect(service).to receive(:commenting_idea_disabled_reason_for_context).and_return nil
      project = create(:continuous_project, no_participation_attributes)
      expect(service.participation_possible_for_context?(project, create(:user))).to be true
    end

    it 'returns true when voting is possible' do
      expect(service).to receive(:idea_voting_disabled_reason_for).and_return nil
      project = create(:continuous_project, no_participation_attributes)
      expect(service.participation_possible_for_context?(project, create(:user))).to be true
    end

    it "returns true when it's possible to take a survey" do
      expect(service).to receive(:taking_survey_disabled_reason_for_context).and_return nil
      project = create(:continuous_project, no_participation_attributes)
      expect(service.participation_possible_for_context?(project, create(:user))).to be true
    end

    it "returns true when it's possible to annotate a document" do
      expect(service).to receive(:annotating_document_disabled_reason_for_context).and_return nil
      project = create(:continuous_project, no_participation_attributes)
      expect(service.participation_possible_for_context?(project, create(:user))).to be true
    end

    it "returns true when it's possible to take a poll" do
      expect(service).to receive(:taking_poll_disabled_reason_for_context).and_return nil
      project = create(:continuous_project, no_participation_attributes)
      expect(service.participation_possible_for_context?(project, create(:user))).to be true
    end

    it 'returns true when participatory budgeting is possible' do
      expect(service).to receive(:budgeting_disabled_reason_for_context).and_return nil
      project = create(:continuous_project, no_participation_attributes)
      expect(service.participation_possible_for_context?(project, create(:user))).to be true
    end

    it 'returns true for information contexts' do
      no_participation_attributes[:participation_method] = 'information'
      project = create(:continuous_project, no_participation_attributes)
      expect(service.participation_possible_for_context?(project, create(:user))).to be true
    end

    it 'returns false when no participation is possible' do
      project = create(:continuous_project, no_participation_attributes)
      expect(service.participation_possible_for_context?(project, create(:user))).to be false
    end
  end

  describe 'get_participation_context' do
    it 'returns the project for a continuous project' do
      project = create(:continuous_project)
      expect(service.get_participation_context(project)).to eq project
    end

    it 'returns the active phase for a timeline project' do
      random_title = SecureRandom.uuid
      project = create(
        :project_with_current_phase,
        current_phase_attrs: { title_multiloc: { 'en' => random_title } }
      )
      expect(service.get_participation_context(project).title_multiloc['en']).to eq random_title
    end

    it 'returns nil for a timeline project without an active phase' do
      project = create(:project_with_past_phases)
      expect(service.get_participation_context(project)).to be_nil
    end

    it "returns nil for a timeline project that's archived" do
      project = create(:project_with_current_phase, admin_publication_attributes: { publication_status: 'archived' })
      expect(service.get_participation_context(project)).to be_nil
    end

    it "returns nil for a continuous project that's archived" do
      project = create(:continuous_project, admin_publication_attributes: { publication_status: 'archived' })
      expect(service.get_participation_context(project)).to be_nil
    end
  end

  describe 'posting_idea_disabled_reason_for_project' do
    it 'returns `posting_disabled` when posting is disabled' do
      project = create(:project_with_current_phase, current_phase_attrs: { posting_enabled: false })
      expect(service.posting_idea_disabled_reason_for_project(project, create(:user))).to eq 'posting_disabled'
    end

    it "returns `nil` when we're in an ideation context" do
      project = create(:project_with_current_phase, current_phase_attrs: { participation_method: 'ideation' })
      expect(service.posting_idea_disabled_reason_for_project(project, create(:user))).to be_nil
    end

    it "returns `nil` when we're in an native_survey context" do
      project = create(:project_with_current_phase, current_phase_attrs: { participation_method: 'native_survey' })
      expect(service.posting_idea_disabled_reason_for_project(project, create(:user))).to be_nil
    end

    it "returns `not_ideation` when we're not in an ideation or native_survey context" do
      project = create(:project_with_current_phase, current_phase_attrs: { participation_method: 'information' })
      expect(service.posting_idea_disabled_reason_for_project(project, create(:user))).to eq 'not_ideation'
    end

    it "returns `not_ideation` when we're in a participatory budgeting context" do
      project = create(
        :project_with_current_phase,
        current_phase_attrs: { participation_method: 'budgeting', max_budget: 1200 }
      )
      expect(service.posting_idea_disabled_reason_for_project(project, create(:user))).to eq 'not_ideation'
    end

    it 'returns `project_inactive` when the timeline is over' do
      project = create(:project_with_past_phases)
      expect(service.posting_idea_disabled_reason_for_project(project, create(:user))).to eq 'project_inactive'
    end

    it "returns 'project_inactive' when the project is archived" do
      project = create(:continuous_project, admin_publication_attributes: { publication_status: 'archived' })
      expect(service.posting_idea_disabled_reason_for_project(project, create(:user))).to eq 'project_inactive'
    end

    it 'returns `posting_limited_max_reached` if the posting limit was reached' do
      user = create(:user)
      project = create(:continuous_project, posting_enabled: true, posting_method: 'limited', posting_limited_max: 1)
      create(:idea, project: project, author: user)

      expect(service.posting_idea_disabled_reason_for_project(project, user)).to eq 'posting_limited_max_reached'
    end

    it 'returns nil if the posting limit was not reached' do
      user = create(:user)
      project = create(:continuous_project, posting_enabled: true, posting_method: 'limited', posting_limited_max: 1)
      create(:idea, project: project)

      expect(service.posting_idea_disabled_reason_for_project(project, user)).to be_nil
    end
  end

  describe 'commenting_idea_disabled_reason_for_project' do
    let(:user) { create(:user) }

    context 'for timeline projects' do
      it 'returns nil when the commenting is allowed in the current phase' do
        project = create(:project_with_current_phase)
        expect(service.commenting_idea_disabled_reason_for_project(project, user)).to be_nil
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.commenting_disabled_reason_for_idea(idea, user)).to be_nil
      end

      it 'returns `commenting_disabled` when commenting is disabled in the current phase' do
        project = create(
          :project_with_current_phase,
          current_phase_attrs: { commenting_enabled: false }
        )
        expect(service.commenting_idea_disabled_reason_for_project(project, user)).to eq 'commenting_disabled'
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.commenting_disabled_reason_for_idea(idea, user)).to eq 'commenting_disabled'
      end

      it "returns 'project_inactive' when the timeline hasn't started" do
        project = create(:project_with_future_phases)
        expect(service.commenting_idea_disabled_reason_for_project(project, user)).to eq 'project_inactive'
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.commenting_disabled_reason_for_idea(idea, user)).to eq 'project_inactive'
      end

      it "returns 'project_inactive' when the timeline is over" do
        project = create(:project_with_past_phases)
        expect(service.commenting_idea_disabled_reason_for_project(project, user)).to eq 'project_inactive'
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.commenting_disabled_reason_for_idea(idea, user)).to eq 'project_inactive'
      end

      it "returns 'project_inactive' when the project is archived" do
        project = create(:project_with_current_phase, admin_publication_attributes: { publication_status: 'archived' })
        expect(service.commenting_idea_disabled_reason_for_project(project, user)).to eq 'project_inactive'
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.commenting_disabled_reason_for_idea(idea, user)).to eq 'project_inactive'
      end

      it "returns nil when we're in a participatory budgeting context" do
        project = create(
          :project_with_current_phase,
          current_phase_attrs: { participation_method: 'budgeting', max_budget: 1200 }
        )
        expect(service.commenting_idea_disabled_reason_for_project(project, user)).to be_nil
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.commenting_disabled_reason_for_idea(idea, user)).to be_nil
      end

      it "returns 'idea_not_in_current_phase' for an idea when it's not in the current phase" do
        project = create(:project_with_current_phase)
        idea = create(:idea, project: project, phases: [project.phases[1]])
        expect(service.commenting_disabled_reason_for_idea(idea, user)).to eq 'idea_not_in_current_phase'
      end
    end

    context 'for continuous project' do
      it "returns 'commenting_disabled' when commenting is disabled in a continuous project" do
        project = create(:continuous_project, commenting_enabled: false)
        expect(service.commenting_idea_disabled_reason_for_project(project, create(:user))).to eq 'commenting_disabled'
        idea = create(:idea, project: project)
        expect(service.commenting_disabled_reason_for_idea(idea, user)).to eq 'commenting_disabled'
      end

      it 'returns nil when commenting is permitted in a continuous project' do
        project = create(:continuous_project)
        expect(service.commenting_idea_disabled_reason_for_project(project, create(:user))).to be_nil
        idea = create(:idea, project: project)
        expect(service.commenting_disabled_reason_for_idea(idea, user)).to be_nil
      end

      it 'returns not_supported when in a survey project' do
        project = create(:continuous_survey_project)
        expect(service.commenting_idea_disabled_reason_for_project(project, create(:user))).to eq 'not_supported'
      end

      it 'returns not_supported when in a document_annotation project' do
        project = create(:continuous_document_annotation_project)
        expect(service.commenting_idea_disabled_reason_for_project(project, create(:user))).to eq 'not_supported'
      end

      it "returns 'project_inactive' when the project is archived" do
        project = create(:continuous_project, admin_publication_attributes: { publication_status: 'archived' })
        expect(service.commenting_idea_disabled_reason_for_project(project, create(:user))).to eq 'project_inactive'
        idea = create(:idea, project: project)
        expect(service.commenting_disabled_reason_for_idea(idea, user)).to eq 'project_inactive'
      end
    end
  end

  describe 'idea_voting_disabled_reason_for' do
    let(:user) { create(:user) }

    context 'a vote' do
      it 'returns nil when voting is enabled in the current phase' do
        project = create(:project_with_current_phase, current_phase_attrs: { voting_enabled: true })
        idea = create(:idea, project: project, phases: project.phases)
        vote = build(:vote, user: user, votable: idea)

        expect(service.idea_voting_disabled_reason_for(vote, user)).to be_nil
      end

      it "returns `project_inactive` when the timeline hasn't started yet" do
        project = create(:project_with_future_phases)
        idea = create(:idea, project: project, phases: project.phases)
        vote = build(:vote, user: user, votable: idea)

        expect(service.idea_voting_disabled_reason_for(vote, user)).to eq 'project_inactive'
      end

      it "returns `idea_not_in_current_phase` when it's not in the current phase" do
        project = create(
          :project_with_current_phase,
          phases_config: { sequence: 'xxcxx' },
          current_phase_attrs: { voting_enabled: true }
        )
        idea_phases = project.phases.order(:start_at).take(2) + [project.phases.order(:start_at).last]
        idea = create(:idea, project: project, phases: idea_phases)
        vote = build(:vote, user: user, votable: idea)

        expect(service.idea_voting_disabled_reason_for(vote, user)).to eq 'idea_not_in_current_phase'
      end

      it 'returns `voting_disabled` if voting is disabled' do
        project = create(:continuous_project, voting_enabled: false)
        idea = create(:idea, project: project)
        vote = build(:vote, user: user, votable: idea)

        expect(service.idea_voting_disabled_reason_for(vote, user)).to eq 'voting_disabled'
      end

      it 'returns `downvoting_disabled` for a downvote if downvoting is disabled' do
        project = create(:continuous_project, voting_enabled: true, downvoting_enabled: false)
        idea = create(:idea, project: project)
        vote = build(:vote, mode: 'down', user: user, votable: idea)

        expect(service.idea_voting_disabled_reason_for(vote, user)).to eq 'downvoting_disabled'
      end

      it 'returns nil for an upvote if downvoting is disabled' do
        project = create(:continuous_project, voting_enabled: true, downvoting_enabled: false)
        idea = create(:idea, project: project)
        vote = build(:vote, mode: 'up', user: user, votable: idea)

        expect(service.idea_voting_disabled_reason_for(vote, user)).to be_nil
      end

      it "returns nil for a downvote, but while the mode is explicitely specified as 'up', even though downvoting is disabled" do
        project = create(:continuous_project, voting_enabled: true, downvoting_enabled: false)
        idea = create(:idea, project: project)
        vote = build(:vote, mode: 'down', user: user, votable: idea)

        expect(service.idea_voting_disabled_reason_for(vote, user, mode: 'up')).to be_nil
      end

      it 'returns `upvoting_limited_max_reached` if the upvoting limit was reached' do
        project = create(:continuous_project, voting_enabled: true, upvoting_method: 'limited', upvoting_limited_max: 1)
        idea = create(:idea, project: project)
        create(:vote, mode: 'up', user: user, votable: idea)
        vote = build(:vote, mode: 'up', user: user, votable: idea)

        expect(service.idea_voting_disabled_reason_for(vote, user)).to eq 'upvoting_limited_max_reached'
      end

      it 'returns nil if the upvoting limit was not reached' do
        project = create(:continuous_project, voting_enabled: true, upvoting_method: 'limited', upvoting_limited_max: 1)
        idea = create(:idea, project: project)
        create(:vote, mode: 'down', user: user, votable: idea)
        vote = build(:vote, mode: 'up', user: user, votable: idea)

        expect(service.idea_voting_disabled_reason_for(vote, user)).to be_nil
      end

      it 'returns `downvoting_limited_max_reached` if the downvoting limit was reached' do
        project = create(:continuous_project, voting_enabled: true,
          downvoting_enabled: true, downvoting_method: 'limited', downvoting_limited_max: 1)
        idea = create(:idea, project: project)
        create(:vote, mode: 'down', user: user, votable: idea)
        vote = build(:vote, mode: 'down', user: user, votable: idea)

        expect(service.idea_voting_disabled_reason_for(vote, user)).to eq 'downvoting_limited_max_reached'
      end

      it 'returns nil if the downvoting limit was not reached' do
        project = create(:continuous_project, voting_enabled: true,
          downvoting_enabled: true, downvoting_method: 'limited', downvoting_limited_max: 1)
        idea = create(:idea, project: project)
        create(:vote, mode: 'up', user: user, votable: idea)
        vote = build(:vote, mode: 'down', user: user, votable: idea)

        expect(service.idea_voting_disabled_reason_for(vote, user)).to be_nil
      end
    end

    context 'an idea' do
      it 'returns nil when voting is enabled' do
        project = create(:continuous_project, voting_enabled: true)
        idea = create(:idea, project: project)

        expect(service.idea_voting_disabled_reason_for(idea, user, mode: 'up')).to be_nil
        expect(service.idea_voting_disabled_reason_for(idea, user, mode: 'down')).to be_nil
      end

      it 'returns `project_inactive` when the timeline has past' do
        project = create(:project_with_past_phases)
        idea = create(:idea, project: project, phases: project.phases)

        expect(service.idea_voting_disabled_reason_for(idea, user, mode: 'up')).to eq 'project_inactive'
        expect(service.idea_voting_disabled_reason_for(idea, user, mode: 'down')).to eq 'project_inactive'
      end

      it "returns `not_ideation` when we're in a participatory budgeting context" do
        project = create(:continuous_budgeting_project)
        idea = create(:idea, project: project)

        expect(service.idea_voting_disabled_reason_for(idea, user, mode: 'up')).to eq 'not_ideation'
        expect(service.idea_voting_disabled_reason_for(idea, user, mode: 'down')).to eq 'not_ideation'
      end

      it "returns `idea_not_in_current_phase` when it's not in the current phase" do
        project = create(
          :project_with_current_phase,
          phases_config: { sequence: 'xxcxx' },
          current_phase_attrs: { voting_enabled: true }
        )
        idea_phases = [project.phases.order(:start_at).first, project.phases.order(:start_at).last]
        idea = create(:idea, project: project, phases: idea_phases)

        expect(service.idea_voting_disabled_reason_for(idea, user, mode: 'up')).to eq 'idea_not_in_current_phase'
        expect(service.idea_voting_disabled_reason_for(idea, user, mode: 'down')).to eq 'idea_not_in_current_phase'
      end

      it 'returns `downvoting_limited_max_reached` if the downvoting limit was reached' do
        project = create(:continuous_project, voting_enabled: true,
          downvoting_enabled: true, downvoting_method: 'limited', downvoting_limited_max: 1)
        idea = create(:idea, project: project)
        create(:vote, mode: 'down', user: user, votable: idea)

        expect(service.idea_voting_disabled_reason_for(idea, user, mode: 'up')).to be_nil
        expect(service.idea_voting_disabled_reason_for(idea, user, mode: 'down')).to eq 'downvoting_limited_max_reached'
      end
    end

    context 'a continuous project' do
      it 'returns nil when voting is enabled' do
        project = create(:continuous_project, voting_enabled: true)

        expect(service.idea_voting_disabled_reason_for(project, user, mode: 'up')).to be_nil
        expect(service.idea_voting_disabled_reason_for(project, user, mode: 'down')).to be_nil
      end

      it 'returns `project_inactive` when the project is archived' do
        project = create(:continuous_project, admin_publication_attributes: { publication_status: 'archived' })

        expect(service.idea_voting_disabled_reason_for(project, user, mode: 'up')).to eq 'project_inactive'
        expect(service.idea_voting_disabled_reason_for(project, user, mode: 'down')).to eq 'project_inactive'
      end

      it "returns `not_ideation` when we're in an information context" do
        project = create(:continuous_project, participation_method: 'information')

        expect(service.idea_voting_disabled_reason_for(project, user, mode: 'up')).to eq 'not_ideation'
        expect(service.idea_voting_disabled_reason_for(project, user, mode: 'down')).to eq 'not_ideation'
      end

      it 'returns `voting_disabled` if voting is disabled' do
        project = create(:continuous_project, voting_enabled: false)

        expect(service.idea_voting_disabled_reason_for(project, user, mode: 'up')).to eq 'voting_disabled'
        expect(service.idea_voting_disabled_reason_for(project, user, mode: 'down')).to eq 'voting_disabled'
      end

      it 'returns nil for upvoting if downvoting is disabled' do
        project = create(:continuous_project, voting_enabled: true, downvoting_enabled: false)

        expect(service.idea_voting_disabled_reason_for(project, user, mode: 'up')).to be_nil
      end

      it 'returns `downvoting_disabled` for downvoting if downvoting is disabled' do
        project = create(:continuous_project, voting_enabled: true, downvoting_enabled: false)

        expect(service.idea_voting_disabled_reason_for(project, user, mode: 'down')).to eq 'downvoting_disabled'
      end
    end

    context 'a timeline project' do
      it 'returns nil when voting is enabled in the current phase' do
        project = create(:project_with_current_phase, current_phase_attrs: { voting_enabled: true })

        expect(service.idea_voting_disabled_reason_for(project, user, mode: 'up')).to be_nil
        expect(service.idea_voting_disabled_reason_for(project, user, mode: 'down')).to be_nil
      end

      it 'returns `project_inactive` when the project is archived' do
        project = create(
          :project_with_current_phase,
          admin_publication_attributes: { publication_status: 'archived' }, current_phase_attrs: { voting_enabled: true }
        )

        expect(service.idea_voting_disabled_reason_for(project, user, mode: 'up')).to eq 'project_inactive'
        expect(service.idea_voting_disabled_reason_for(project, user, mode: 'down')).to eq 'project_inactive'
      end

      it "returns `project_inactive` when the timeline hasn't started yet" do
        project = create(:project_with_future_phases)

        expect(service.idea_voting_disabled_reason_for(project, user, mode: 'up')).to eq 'project_inactive'
        expect(service.idea_voting_disabled_reason_for(project, user, mode: 'down')).to eq 'project_inactive'
      end

      it 'returns `project_inactive` when the timeline has past' do
        project = create(:project_with_past_phases)

        expect(service.idea_voting_disabled_reason_for(project, user, mode: 'up')).to eq 'project_inactive'
        expect(service.idea_voting_disabled_reason_for(project, user, mode: 'down')).to eq 'project_inactive'
      end

      it "returns `not_ideation` when we're in a participatory budgeting context dsofifopwefwe" do
        project = create(:project_with_current_phase, current_phase_attrs: { participation_method: 'budgeting' })

        expect(service.idea_voting_disabled_reason_for(project, user, mode: 'up')).to eq 'not_ideation'
        expect(service.idea_voting_disabled_reason_for(project, user, mode: 'down')).to eq 'not_ideation'
      end

      it 'returns `voting_disabled` if voting is disabled' do
        project = create(:project_with_current_phase, current_phase_attrs: { voting_enabled: false })

        expect(service.idea_voting_disabled_reason_for(project, user, mode: 'up')).to eq 'voting_disabled'
        expect(service.idea_voting_disabled_reason_for(project, user, mode: 'down')).to eq 'voting_disabled'
      end

      it 'returns `upvoting_limited_max_reached` if the upvoting limit was reached' do
        project = create(:project_with_current_phase,
          current_phase_attrs: { voting_enabled: true, upvoting_method: 'limited', upvoting_limited_max: 1 })
        create(:vote, mode: 'up', user: user, votable: create(:idea, project: project, phases: project.phases))

        expect(service.idea_voting_disabled_reason_for(project, user, mode: 'up')).to eq 'upvoting_limited_max_reached'
        expect(service.idea_voting_disabled_reason_for(project, user, mode: 'down')).to be_nil
      end
    end

    context 'a phase' do
      it 'returns nil when voting is enabled' do
        project = create(
          :project_with_current_phase,
          phases_config: { sequence: 'xcx', c: { voting_enabled: true }, x: { voting_enabled: false } }
        )
        phase = project.phases.order(:start_at)[1]

        expect(service.idea_voting_disabled_reason_for(phase, user, mode: 'up')).to be_nil
        expect(service.idea_voting_disabled_reason_for(phase, user, mode: 'down')).to be_nil
      end

      it 'returns nil when voting is enabled for that phase, but disabled for the current phase' do
        project = create(
          :project_with_current_phase,
          phases_config: { sequence: 'xxcxx', c: { voting_enabled: false }, x: { voting_enabled: true } }
        )
        phase = project.phases.order(:start_at).first

        expect(service.idea_voting_disabled_reason_for(phase, user, mode: 'up')).to be_nil
        expect(service.idea_voting_disabled_reason_for(phase, user, mode: 'down')).to be_nil
      end

      it 'returns `upvoting_limited_max_reached` if the upvoting limit was reached for that phase' do
        project = create(
          :project_with_current_phase,
          phases_config: { sequence: 'xxcxx', c: { voting_enabled: true },
                           x: { voting_enabled: true, upvoting_method: 'limited', upvoting_limited_max: 2 } }
        )
        phase = project.phases.order(:start_at).first
        ideas = create_list(:idea, 2, project: project, phases: project.phases)
        ideas.each do |idea|
          create(:vote, mode: 'up', votable: idea, user: user)
        end

        expect(service.idea_voting_disabled_reason_for(phase, user, mode: 'up')).to eq 'upvoting_limited_max_reached'
        expect(service.idea_voting_disabled_reason_for(phase, user, mode: 'down')).to be_nil
      end
    end
  end

  describe 'cancelling_votes_disabled_reasons' do
    let(:user) { create(:user) }
    let(:reasons) { ParticipationContextService::VOTING_DISABLED_REASONS }

    context 'timeline project' do
      it 'returns nil when voting is enabled in the current phase' do
        project = create(:project_with_current_phase)
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.cancelling_votes_disabled_reason_for_idea(idea, idea.author)).to be_nil
      end

      it "returns `idea_not_in_current_phase` when it's not in the current phase" do
        project = create(:project_with_current_phase)
        idea = create(:idea, project: project, phases: [project.phases[1]])
        expect(service.cancelling_votes_disabled_reason_for_idea(idea, idea.author)).to eq reasons[:idea_not_in_current_phase]
      end

      it "returns 'voting_disabled' if it's in the current phase and voting is disabled" do
        project = create(:project_with_current_phase, current_phase_attrs: { voting_enabled: false })
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.cancelling_votes_disabled_reason_for_idea(idea, idea.author)).to eq reasons[:voting_disabled]
      end

      it "returns 'project_inactive' when the timeline has past" do
        project = create(:project_with_past_phases)
        idea = create(:idea, project: project, phases: project.phases)
        expect(service.cancelling_votes_disabled_reason_for_idea(idea, idea.author)).to eq reasons[:project_inactive]
      end

      it "returns `not_ideation` when we're in a participatory budgeting context" do
        project = create(
          :project_with_current_phase,
          current_phase_attrs: { participation_method: 'budgeting', max_budget: 1200 }
        )
        idea = create(:idea, project: project, phases: project.phases)
        expect(service.cancelling_votes_disabled_reason_for_idea(idea, idea.author)).to eq 'not_ideation'
      end
    end

    context 'continuous project' do
      it 'returns nil when voting is enabled' do
        project = create(:continuous_project)
        idea = create(:idea, project: project)
        expect(service.cancelling_votes_disabled_reason_for_idea(idea, idea.author)).to be_nil
      end

      it "returns 'project_inactive' when the project is archived" do
        project = create(:continuous_project, admin_publication_attributes: { publication_status: 'archived' })
        idea = create(:idea, project: project, phases: project.phases)
        expect(service.cancelling_votes_disabled_reason_for_idea(idea, idea.author)).to eq reasons[:project_inactive]
      end

      it "returns 'voting_disabled' if voting is disabled" do
        project = create(:continuous_project, voting_enabled: false)
        idea = create(:idea, project: project)
        expect(service.cancelling_votes_disabled_reason_for_idea(idea, idea.author)).to eq reasons[:voting_disabled]
      end

      it 'returns nil when downvoting is disabled but voting is enabled' do
        project = create(:continuous_project, voting_enabled: true, downvoting_enabled: false)
        idea = create(:idea, project: project)
        expect(service.cancelling_votes_disabled_reason_for_idea(idea, idea.author)).to be_nil
      end
    end
  end

  describe 'taking_survey_disabled_reason' do
    it 'returns `not_survey` when the active context is not a survey' do
      project = create(:project_with_current_phase, current_phase_attrs: { participation_method: 'ideation' })
      expect(service.taking_survey_disabled_reason_for_project(project, create(:user))).to eq 'not_survey'
    end

    it 'returns `project_inactive` when the timeline has past' do
      project = create(:project_with_past_phases)
      expect(service.taking_survey_disabled_reason_for_project(project, create(:user))).to eq 'project_inactive'
    end

    it 'returns `project_inactive` when the continuous project is archived' do
      project = create(:continuous_project, admin_publication_attributes: { publication_status: 'archived' })
      expect(service.taking_survey_disabled_reason_for_project(project, create(:user))).to eq 'project_inactive'
    end
  end

  describe 'document_annotation_disabled_reason' do
    it 'returns `not_document_annotation` when the active context is not document_annotation' do
      project = create(:project_with_current_phase, current_phase_attrs: { participation_method: 'ideation' })
      expect(service.annotating_document_disabled_reason_for_project(project, create(:user)))
        .to eq 'not_document_annotation'
    end

    it 'returns `project_inactive` when the timeline has past' do
      project = create(:project_with_past_phases)
      expect(service.annotating_document_disabled_reason_for_project(project, create(:user))).to eq 'project_inactive'
    end

    it 'returns `project_inactive` when the continuous project is archived' do
      project = create(:continuous_project, admin_publication_attributes: { publication_status: 'archived' })
      expect(service.annotating_document_disabled_reason_for_project(project, create(:user))).to eq 'project_inactive'
    end
  end

  describe 'taking_poll_disabled_reason' do
    it 'returns `not_poll` when the active context is not a poll' do
      project = create(:project_with_current_phase, current_phase_attrs: { participation_method: 'information' })
      expect(service.taking_poll_disabled_reason_for_project(project, create(:user))).to eq 'not_poll'
    end

    it 'returns `already_responded` when the user already responded to the poll before' do
      project = create(:continuous_poll_project)
      poll_response = create(:poll_response, participation_context: project)
      user = poll_response.user
      expect(service.taking_poll_disabled_reason_for_project(project, user)).to eq 'already_responded'
    end

    it 'returns `project_inactive` when the timeline has past' do
      project = create(:project_with_past_phases)
      expect(service.taking_poll_disabled_reason_for_project(project, create(:user))).to eq 'project_inactive'
    end

    it 'returns `project_inactive` when the continuous project is archived' do
      project = create(:continuous_project, admin_publication_attributes: { publication_status: 'archived' })
      expect(service.taking_poll_disabled_reason_for_project(project, create(:user))).to eq 'project_inactive'
    end
  end

  describe 'budgeting_disabled_reasons' do
    context 'for timeline projects' do
      it 'returns nil when the idea is in the current phase and budgeting is allowed' do
        project = create(:project_with_current_phase, phases_config: {
          sequence: 'xxcxx'
        }, current_phase_attrs: { participation_method: 'budgeting', max_budget: 10_000 })
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.budgeting_disabled_reason_for_idea(idea, create(:user))).to be_nil
      end

      it 'returns `idea_not_in_current_phase` when the idea is not in the current phase, budgeting is allowed in the current phase and was allowed in the last phase the idea was part of' do
        project = create(:project_with_current_phase, phases_config: {
          sequence: 'xxcxx'
        }, current_phase_attrs: { participation_method: 'budgeting', max_budget: 10_000 })
        idea = create(:idea, project: project, phases: [project.phases[1]])
        expect(service.budgeting_disabled_reason_for_idea(idea, create(:user))).to eq 'idea_not_in_current_phase'
      end

      it "returns 'idea_not_in_current_phase' when the idea is not in the current phase, budgeting is permitted but was not permitted in the last phase the idea was part of" do
        project = create(
          :project_with_current_phase,
          current_phase_attrs: { participation_method: 'budgeting', max_budget: 10_000 }
        )
        phase = project.phases[1]
        permission = phase.permissions.find_by(action: 'budgeting')
        permission&.update!(
          permitted_by: 'groups',
          group_ids: create_list(:group, 2).map(&:id)
        )
        idea = create(:idea, project: project, phases: [project.phases[0], project.phases[1]])
        expect(service.budgeting_disabled_reason_for_idea(idea, create(:user))).to eq 'idea_not_in_current_phase'
      end

      it "returns 'project_inactive' when the timeline is over" do
        project = create(:project_with_past_phases)
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.budgeting_disabled_reason_for_idea(idea, create(:user))).to eq 'project_inactive'
      end
    end

    context 'continuous project' do
      it 'returns nil when budgeting is permitted in a continuous project' do
        project = create(:continuous_budgeting_project)
        idea = create(:idea, project: project)
        expect(service.budgeting_disabled_reason_for_idea(idea, create(:user))).to be_nil
      end

      it "returns 'project_inactive' when the project is archived" do
        project = create(:continuous_budgeting_project, admin_publication_attributes: { publication_status: 'archived' })
        idea = create(:idea, project: project)
        expect(service.budgeting_disabled_reason_for_idea(idea, create(:user))).to eq 'project_inactive'
      end
    end
  end

  describe 'future_posting_enabled_phase' do
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
      expect(service.future_posting_idea_enabled_phase(project, create(:user))).to eq project.phases.order(:start_at)[7]
    end

    it 'returns nil if no next phase has posting enabled' do
      project = create(
        :project_with_current_phase,
        phases_config: {
          sequence: 'xcyyy',
          y: { posting_enabled: false }
        }
      )
      expect(service.future_posting_idea_enabled_phase(project, create(:user))).to be_nil
    end

    it 'returns nil for a continuous project' do
      project = create(:continuous_project)
      expect(service.future_posting_idea_enabled_phase(project, create(:user))).to be_nil
    end

    it 'returns nil for a project without future phases' do
      project = create(:project_with_past_phases)
      expect(service.future_posting_idea_enabled_phase(project, create(:user))).to be_nil
    end
  end

  describe 'future_voting_enabled_phase' do
    it 'returns the first upcoming phase that has voting enabled' do
      project = create(
        :project_with_current_phase,
        phases_config: {
          sequence: 'xcxxy',
          x: { voting_enabled: true, downvoting_enabled: false },
          c: { voting_enabled: false },
          y: { voting_enabled: true, downvoting_enabled: true }
        }
      )
      expect(service.future_upvoting_idea_enabled_phase(project, create(:user))).to eq project.phases.order(:start_at)[2]
      expect(service.future_downvoting_idea_enabled_phase(project, create(:user))).to eq project.phases.order(:start_at)[4]
    end

    it 'returns nil if no next phase has voting enabled' do
      project = create(
        :project_with_current_phase,
        phases_config: {
          sequence: 'xcyy',
          y: { voting_enabled: false }
        }
      )
      expect(service.future_upvoting_idea_enabled_phase(project, create(:user))).to be_nil
      expect(service.future_downvoting_idea_enabled_phase(project, create(:user))).to be_nil
    end

    it 'returns nil for a continuous project' do
      project = create(:continuous_project)
      expect(service.future_upvoting_idea_enabled_phase(project, create(:user))).to be_nil
      expect(service.future_downvoting_idea_enabled_phase(project, create(:user))).to be_nil
    end

    it 'returns nil for a project without future phases' do
      project = create(:project_with_past_phases)
      expect(service.future_upvoting_idea_enabled_phase(project, create(:user))).to be_nil
      expect(service.future_downvoting_idea_enabled_phase(project, create(:user))).to be_nil
    end
  end

  describe 'future_commenting_enabled_phase' do
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
      expect(service.future_commenting_idea_enabled_phase(project, create(:user))).to eq project.phases.order(:start_at)[7]
    end

    it 'returns nil if no next phase has commenting enabled' do
      project = create(
        :project_with_current_phase,
        phases_config: {
          sequence: 'xcyyy',
          y: { commenting_enabled: false }
        }
      )
      expect(service.future_commenting_idea_enabled_phase(project, create(:user))).to be_nil
    end

    it 'returns nil for a continuous project' do
      project = create(:continuous_project)
      expect(service.future_commenting_idea_enabled_phase(project, create(:user))).to be_nil
    end

    it 'returns nil for a project without future phases' do
      project = create(:project_with_past_phases)
      expect(service.future_commenting_idea_enabled_phase(project, create(:user))).to be_nil
    end
  end
end
