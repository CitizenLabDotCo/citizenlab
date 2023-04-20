# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::FactParticipation do
  context 'without dimension types being present' do
    let!(:idea) { create(:idea) }
    let!(:initiative) { create(:initiative) }

    it 'no participations will be returned' do
      expect(described_class.count).to eq(0)
    end
  end

  context 'when dimension types have been created' do
    before_all do
      # Type dimensions
      [
        { name: 'idea', parent: 'post' },
        { name: 'initiative', parent: 'post' },
        { name: 'comment', parent: 'idea' },
        { name: 'vote', parent: 'idea' },
        { name: 'poll', parent: nil },
        { name: 'volunteer', parent: nil },
        { name: 'survey', parent: nil }
      ].each do |type|
        create(:dimension_type, name: type[:name], parent: type[:parent])
      end
    end

    context 'when an idea is created' do
      let!(:idea) { create(:idea) }

      it 'is also available as a participation fact' do
        described_class.find(idea.id)
        expect(described_class.find(idea.id).dimension_type.name).to eq('idea')
      end
    end

    context 'when an initiative is created' do
      let!(:initiative) { create(:initiative) }

      it 'is also available as a participation fact' do
        described_class.find(initiative.id)
        expect(described_class.find(initiative.id).dimension_type.name).to eq('initiative')
      end
    end

    context 'when a comment is added' do
      let!(:comment) { create(:comment) }

      it 'is also available as a participation fact' do
        described_class.find(comment.id)
        expect(described_class.find(comment.id).dimension_type.name).to eq('comment')
      end
    end

    context 'when a vote is added' do
      let!(:vote) { create(:vote) }

      it 'is also available as a participation fact' do
        described_class.find(vote.id)
        expect(described_class.find(vote.id).dimension_type.name).to eq('vote')
      end
    end

    context 'when a volunteer is added' do
      let!(:volunteer) { create(:volunteer) }

      it 'is also available as a participation fact' do
        described_class.find(volunteer.id)
        expect(described_class.find(volunteer.id).dimension_type.name).to eq('volunteer')
      end
    end

    context 'when a poll response is added' do
      let!(:poll_response) { create(:poll_response) }

      it 'is also available as a participation fact' do
        described_class.find(poll_response.id)
        expect(described_class.find(poll_response.id).dimension_type.name).to eq('poll')
      end
    end

    context 'when a native survey response is added in a continuous project' do
      let(:idea_status) { create(:idea_status_proposed) }
      let(:project) { create(:continuous_native_survey_project) }
      let(:input) { create(:idea, project: project, idea_status: idea_status) }

      it 'is also available as a participation fact' do
        described_class.find(input.id)
        expect(described_class.find(input.id).dimension_type.name).to eq('survey')
      end
    end

    context 'when a native survey response is added in a phase' do
      let(:idea_status) { create(:idea_status_proposed) }
      let(:project) { create(:project_with_active_native_survey_phase) }
      let(:input) { create(:idea, project: project, idea_status: idea_status, creation_phase: project.phases.first) }

      it 'is also available as a participation fact' do
        described_class.find(input.id)
        expect(described_class.find(input.id).dimension_type.name).to eq('survey')
      end
    end
  end
end
