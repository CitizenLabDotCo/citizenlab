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
      Analytics::PopulateDimensionsService.populate_types
    end

    context 'when an idea is created and published' do
      let!(:idea) { create(:idea) }

      it 'is also available as a participation fact' do
        participation = described_class.find(idea.id)
        expect(participation.dimension_type.name).to eq('idea')
      end
    end

    context 'when an idea is created but not published' do
      let!(:idea) { create(:idea, publication_status: 'draft') }

      it 'is not available as a participation fact' do
        expect(described_class.count).to eq(0)
      end
    end

    # TODO: cleanup-after-proposals-migration
    context 'when an initiative is created' do
      let!(:initiative) { create(:initiative) }

      it 'is also available as a participation fact' do
        participation = described_class.find(initiative.id)
        expect(participation.dimension_type.name).to eq('initiative')
      end
    end

    context 'when a comment is added' do
      let!(:comment) { create(:comment) }

      it 'is also available as a participation fact' do
        participation = described_class.find(comment.id)
        expect(participation.dimension_type.name).to eq('comment')
      end
    end

    context 'when a reaction is added' do
      let!(:reaction) { create(:reaction) }

      it 'is also available as a participation fact' do
        participation = described_class.find(reaction.id)
        expect(participation.dimension_type.name).to eq('reaction')
      end
    end

    context 'when a volunteer is added' do
      let!(:volunteer) { create(:volunteer) }

      it 'is also available as a participation fact' do
        participation = described_class.find(volunteer.id)
        expect(participation.dimension_type.name).to eq('volunteer')
      end
    end

    context 'when a poll response is added' do
      let!(:poll_response) { create(:poll_response) }

      it 'is also available as a participation fact' do
        participation = described_class.find(poll_response.id)
        expect(participation.dimension_type.name).to eq('poll')
      end
    end

    context 'when a native survey response is added in a phase' do
      let(:idea_status) { create(:idea_status_proposed) }
      let(:project) { create(:project_with_active_native_survey_phase) }
      let(:input) { create(:idea, project: project, idea_status: idea_status, creation_phase: project.phases.first) }

      it 'is also available as a participation fact' do
        participation = described_class.find(input.id)
        expect(participation.dimension_type.name).to eq('survey')
      end
    end

    context 'when a basket is created' do
      let(:basket) { create(:basket) }

      it 'is also available as a participation fact' do
        participation = described_class.find(basket.id)
        expect(participation.dimension_type.name).to eq('basket')
      end
    end

    context 'when an event is attended' do
      let(:event_attendance) { create(:event_attendance) }

      it 'is also available as a participation fact' do
        participation = described_class.find(event_attendance.id)
        expect(participation.dimension_type.name).to eq('event_attendance')
      end
    end
  end
end
