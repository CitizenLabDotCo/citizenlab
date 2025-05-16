# frozen_string_literal: true

require 'rails_helper'

describe CommonGround::ProgressService do
  subject(:service) { described_class.new(phase) }

  describe '#initialize' do
    context 'when phase is not a common ground phase' do
      let(:phase) { create(:information_phase) }

      it 'raises error when phase is not a common ground phase' do
        expect { service }
          .to raise_error(CommonGround::ProgressService::UnsupportedPhaseError)
      end
    end
  end

  describe '#user_progress' do
    subject(:progress) { service.user_progress(user) }

    let_it_be(:phase) { create(:common_ground_phase) }
    let_it_be(:user) { create(:user) }

    before_all do
      # Ideas and reaction that should not be taken into account.
      create(:idea)
      create(:reaction)
    end

    context 'when there is no inputs' do
      it 'returns progress for the given user' do
        expect(progress.phase_id).to eq(phase.id)
        expect(progress.num_ideas).to eq(0)
        expect(progress.num_reacted_ideas).to eq(0)
        expect(progress.next_idea).to be_nil
      end
    end

    context 'when there are inputs' do
      let_it_be(:inputs) { create_list(:idea, 3, project: phase.project, phases: [phase]) }

      it 'returns progress for the given user' do
        expect(progress.phase_id).to eq(phase.id)
        expect(progress.num_ideas).to eq(3)
        expect(progress.num_reacted_ideas).to eq(0)
        expect(inputs).to include(progress.next_idea)
      end

      it 'returns the idea without reaction as next_idea' do
        next_idea, *other_ideas = inputs
        other_ideas.each { |idea| create(:reaction, reactable: idea, user: user) }

        expect(progress.phase_id).to eq(phase.id)
        expect(progress.num_ideas).to eq(3)
        expect(progress.num_reacted_ideas).to eq(2)

        expect(progress.next_idea).to eq(next_idea)
      end

      it 'only takes into account ideas that are published' do
        inputs.first.update!(publication_status: 'draft')
        inputs.second.update!(publication_status: 'submitted')

        expect(progress.num_ideas).to eq(1)
      end
    end
  end
end
