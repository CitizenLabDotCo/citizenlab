# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::Contribution do
  describe 'inputs' do
    it 'exposes a published idea with its phase inferred from the contribution date' do
      idea = create(:idea, submitted_at: Time.zone.now)
      row = described_class.find(idea.id)

      expect(row.type).to eq 'input'
      expect(row.parent_type).to be_nil
      expect(row.project_id).to eq idea.project_id
      expect(row.phase_id).to eq idea.project.phases.first.id
      expect(row.participation_method).to eq 'ideation'
      expect(row.user_id).to eq idea.author_id
      expect(row.participant_id).to eq idea.author_id
    end

    it 'uses the creation phase for phase-specific inputs like survey responses' do
      create(:idea_status_proposed)
      response = create(:native_survey_response, submitted_at: 2.days.ago)
      row = described_class.find(response.id)

      expect(row.type).to eq 'input'
      expect(row.phase_id).to eq response.creation_phase_id
      expect(row.participation_method).to eq 'native_survey'
      expect(row.contributed_at).to eq response.submitted_at
    end

    it 'excludes unpublished inputs' do
      create(:idea, publication_status: 'draft')

      expect(described_class.where(type: 'input')).to be_empty
    end

    it 'identifies anonymous authors by their stable author hash' do
      idea = create(:idea, anonymous: true, submitted_at: Time.zone.now)
      row = described_class.find(idea.id)

      expect(row.user_id).to be_nil
      expect(row.participant_id).to eq idea.reload.author_hash
    end

    it 'keeps the collection method when the idea was published while another phase was active' do
      project = create(:project)
      create(:phase, project: project, participation_method: 'ideation',
        start_at: '2026-01-01', end_at: '2026-02-01')
      voting = create(:phase, project: project, participation_method: 'voting',
        voting_method: 'single_voting', start_at: '2026-02-01', end_at: nil)
      idea = create(:idea, project: project,
        created_at: '2026-02-10', submitted_at: '2026-02-10', published_at: '2026-02-10')
      row = described_class.find(idea.id)

      expect(row.participation_method).to eq 'ideation'
      expect(row.phase_id).to eq voting.id
    end

    it 'defaults to ideation when the idea falls outside every phase window' do
      project = create(:project)
      create(:phase, project: project, participation_method: 'ideation',
        start_at: '2026-01-01', end_at: '2026-02-01')
      idea = create(:idea, project: project,
        created_at: '2026-03-01', submitted_at: '2026-03-01', published_at: '2026-03-01')
      row = described_class.find(idea.id)

      expect(row.participation_method).to eq 'ideation'
      expect(row.phase_id).to be_nil
    end
  end

  describe 'comments' do
    it 'exposes a comment as a child of its input' do
      comment = create(:comment)
      row = described_class.find(comment.id)

      expect(row.type).to eq 'comment'
      expect(row.parent_type).to eq 'input'
      expect(row.parent_id).to eq comment.idea_id
      expect(row.project_id).to eq comment.idea.project_id
      expect(row.user_id).to eq comment.author_id
    end

    it 'excludes deleted comments' do
      comment = create(:comment)
      comment.update_column(:publication_status, 'deleted')

      expect(described_class.where(type: 'comment')).to be_empty
    end

    it 'infers the phase active at commenting time' do
      project = create(:project)
      ideation = create(:phase, project: project, participation_method: 'ideation',
        start_at: '2026-01-01', end_at: '2026-02-01')
      voting = create(:phase, project: project, participation_method: 'voting',
        voting_method: 'single_voting', start_at: '2026-02-01', end_at: nil)
      idea = create(:idea, project: project, phases: [ideation],
        created_at: '2026-01-10', submitted_at: '2026-01-10', published_at: '2026-01-10')
      comment = create(:comment, idea: idea, created_at: '2026-02-10')

      expect(described_class.find(idea.id).phase_id).to eq ideation.id
      expect(described_class.find(comment.id).phase_id).to eq voting.id
    end

    it 'falls back to the input collection method when no phase window matches' do
      project = create(:project)
      create(:phase, project: project, participation_method: 'ideation',
        start_at: '2026-01-01', end_at: '2026-02-01')
      idea = create(:idea, project: project,
        created_at: '2026-01-10', submitted_at: '2026-01-10', published_at: '2026-01-10')
      comment = create(:comment, idea: idea, created_at: '2026-03-01')
      row = described_class.find(comment.id)

      expect(row.phase_id).to be_nil
      expect(row.participation_method).to eq 'ideation'
    end
  end

  describe 'reactions' do
    it 'exposes a reaction on an input' do
      reaction = create(:reaction)
      row = described_class.find(reaction.id)

      expect(row.type).to eq 'reaction'
      expect(row.parent_type).to eq 'input'
      expect(row.parent_id).to eq reaction.reactable_id
      expect(row.project_id).to eq reaction.reactable.project_id
    end

    it 'resolves the project of a reaction on a comment through its input' do
      comment = create(:comment)
      reaction = create(:comment_reaction, reactable: comment)
      row = described_class.find(reaction.id)

      expect(row.parent_type).to eq 'comment'
      expect(row.parent_id).to eq comment.id
      expect(row.project_id).to eq comment.idea.project_id
    end
  end

  describe 'votes' do
    it 'exposes one vote per picked input in a submitted basket' do
      basket = create(:basket)
      baskets_ideas = create_list(:baskets_idea, 2, basket: basket)
      rows = described_class.where(type: 'vote')

      expect(rows.map(&:id)).to match_array baskets_ideas.map(&:id)
      rows.each do |row|
        expect(row.parent_type).to eq 'input'
        expect(row.contributed_at).to eq basket.submitted_at
        expect(row.phase_id).to eq basket.phase_id
        expect(row.project_id).to eq basket.phase.project_id
        expect(row.participation_method).to eq 'voting'
        expect(row.participant_id).to eq basket.user_id
      end
    end

    it 'excludes votes in unsubmitted baskets' do
      basket = create(:basket, submitted_at: nil)
      create(:baskets_idea, basket: basket)

      expect(described_class.where(type: 'vote')).to be_empty
    end
  end

  describe 'other participation types' do
    it 'exposes volunteering with its cause phase and project' do
      volunteer = create(:volunteer)
      row = described_class.find(volunteer.id)

      expect(row.type).to eq 'volunteering'
      expect(row.phase_id).to eq volunteer.cause.phase_id
      expect(row.project_id).to eq volunteer.cause.phase.project_id
      expect(row.user_id).to eq volunteer.user_id
    end

    it 'exposes poll responses with their phase and project' do
      response = create(:poll_response)
      row = described_class.find(response.id)

      expect(row.type).to eq 'poll_response'
      expect(row.phase_id).to eq response.phase_id
      expect(row.project_id).to eq response.phase.project_id
    end

    it 'exposes event attendances with their project but no phase' do
      attendance = create(:event_attendance)
      row = described_class.find(attendance.id)

      expect(row.type).to eq 'attendance'
      expect(row.phase_id).to be_nil
      expect(row.project_id).to eq attendance.event.project_id
      expect(row.participant_id).to eq attendance.attendee_id
    end
  end
end
