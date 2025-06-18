# frozen_string_literal: true

require 'rails_helper'

describe CommonGround::ResultsService do
  subject(:service) { described_class.new(phase) }

  let_it_be(:phase) { create(:common_ground_phase) }

  describe '#initialize' do
    context 'when phase is not a common ground phase' do
      let(:phase) { create(:information_phase) }

      it 'raises error when phase is not a common ground phase' do
        expect { service }
          .to raise_error(CommonGround::Errors::UnsupportedPhaseError)
      end
    end
  end

  describe '#results' do
    subject(:results) { service.results(n) }

    let(:n) { 2 }

    context 'when there are no ideas' do
      it 'returns results with empty arrays and zero stats' do
        expect(results.phase_id).to eq(phase.id)
        expect(results.top_consensus_ideas).to be_empty
        expect(results.top_controversial_ideas).to be_empty
        expect(results.stats[:num_participants]).to eq(0)
        expect(results.stats[:num_ideas]).to eq(0)
        expect(results.stats[:votes]).to eq({ up: 0, down: 0, neutral: 0 })
      end
    end

    context 'when there are ideas without reactions' do
      let_it_be(:ideas) { create_list(:idea, 3, project: phase.project, phases: [phase]) }

      it 'returns results with empty consensus arrays and correct stats' do
        expect(results.phase_id).to eq(phase.id)
        expect(results.top_consensus_ideas).to be_empty
        expect(results.top_controversial_ideas).to be_empty
        expect(results.stats[:num_participants]).to eq(0)
        expect(results.stats[:num_ideas]).to eq(3)
        expect(results.stats[:votes]).to eq({ up: 0, down: 0, neutral: 0 })
      end
    end

    context 'when there are ideas with reactions' do
      let_it_be(:user1) { create(:user) }
      let_it_be(:user2) { create(:user) }
      let_it_be(:user3) { create(:user) }
      let_it_be(:user4) { create(:user) }
      let_it_be(:user5) { create(:user) }

      let_it_be(:idea1) { create(:idea, project: phase.project, phases: [phase]) }
      let_it_be(:idea2) { create(:idea, project: phase.project, phases: [phase]) }
      let_it_be(:idea3) { create(:idea, project: phase.project, phases: [phase]) }
      let_it_be(:idea4) { create(:idea, project: phase.project, phases: [phase]) }

      before_all do
        # Idea1: High consensus score (1.0) - 3 likes, 0 dislikes
        create(:reaction, reactable: idea1, user: user1, mode: 'up')
        create(:reaction, reactable: idea1, user: user2, mode: 'up')
        create(:reaction, reactable: idea1, user: user3, mode: 'up')

        # Idea2: Medium consensus score (0.67) - 2 likes, 1 dislike
        create(:reaction, reactable: idea2, user: user1, mode: 'up')
        create(:reaction, reactable: idea2, user: user4, mode: 'up')
        create(:reaction, reactable: idea2, user: user5, mode: 'down')

        # Idea3: Lower consensus score (0.5) - 1 like, 1 dislike
        create(:reaction, reactable: idea3, user: user2, mode: 'up')
        create(:reaction, reactable: idea3, user: user3, mode: 'down')

        # Idea4: No reactions (should not appear in consensus lists)

        # Add neutral reactions for vote counting
        create(:reaction, reactable: idea1, user: user4, mode: 'neutral')
        create(:reaction, reactable: idea4, user: user5, mode: 'neutral')

        # Reload to update counter caches
        [idea1, idea2, idea3, idea4].each(&:reload)
      end

      it 'returns correct phase_id' do
        expect(results.phase_id).to eq(phase.id)
      end

      it 'returns top consensus ideas ordered by consensus score (highest first)' do
        expect(results.top_consensus_ideas).to eq [idea1, idea2]
      end

      context 'when there are ties in consensus scores' do
        let!(:idea5) do
          idea = create(:idea, project: phase.project, phases: [phase])
          create_list(:reaction, 5, reactable: idea, mode: 'up')
          idea
        end

        it 'returns the idea with the highest number of votes first' do
          expect(results.top_consensus_ideas).to eq [idea5, idea1]
        end
      end

      it 'returns top controversial ideas ordered by consensus score (lowest first)' do
        expect(results.top_controversial_ideas).to eq [idea3, idea2]
      end

      it 'respects the limit parameter' do
        limited_results = service.results(1)
        expect(limited_results.top_consensus_ideas).to contain_exactly(idea1)
        expect(limited_results.top_controversial_ideas).to contain_exactly(idea3)
      end

      it 'returns correct stats' do
        stats = results.stats

        expect(stats[:num_participants]).to eq(5)
        expect(stats[:num_ideas]).to eq(4)
        expect(stats[:votes][:up]).to eq(6)
        expect(stats[:votes][:down]).to eq(2)
        expect(stats[:votes][:neutral]).to eq(2)
      end

      it 'can be converted into a hash' do
        expect(results.to_h).to include(
          phase_id: phase.id,
          top_consensus_ideas: [idea1, idea2],
          top_controversial_ideas: [idea3, idea2],
          stats: {
            num_participants: 5,
            num_ideas: 4,
            votes: { up: 6, down: 2, neutral: 2 }
          }
        )
      end

      context 'when there are draft ideas' do
        let!(:draft_idea) { create(:idea, project: phase.project, phases: [phase], publication_status: 'draft') }
        let(:n) { IdeasPhase.where(phase: phase).count }

        before do
          create(:reaction, reactable: draft_idea, user: user1, mode: 'up')
        end

        it 'does not include draft ideas in results' do
          expect(results.stats[:num_ideas]).to eq(4)
          expect(results.stats[:votes][:up]).to eq(6)
          expect(results.top_consensus_ideas).not_to include(draft_idea)
        end
      end

      context 'when there are ideas from other phases' do
        let!(:other_idea) { create(:idea) }
        let(:n) { Idea.count }

        before do
          create(:reaction, reactable: other_idea, user: user1, mode: 'up')
        end

        it 'excludes ideas from other phases' do
          expect(results.top_consensus_ideas).not_to include(other_idea)
          expect(results.stats[:num_ideas]).to eq(4)
        end
      end
    end
  end
end
