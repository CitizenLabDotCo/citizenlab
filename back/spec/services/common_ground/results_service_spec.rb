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

    def idea_with_reactions(up: 0, down: 0)
      create(:idea, project: phase.project, phases: [phase]).tap do |idea|
        create_list(:reaction, up, reactable: idea, mode: 'up')
        create_list(:reaction, down, reactable: idea, mode: 'down')
      end
    end

    context 'when there are no ideas' do
      it 'returns results with empty arrays and zero stats' do
        expect(results.phase_id).to eq(phase.id)
        expect(results.top_consensus_ideas).to be_empty
        expect(results.top_controversial_ideas).to be_empty
        expect(results.ideas_by_agreement).to be_empty
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
        expect(results.ideas_by_agreement).to be_empty
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

        # Idea4: Only neutral reactions (should not appear in consensus lists)

        # Add neutral reactions for vote counting
        create(:reaction, reactable: idea1, user: user4, mode: 'neutral')
        create(:reaction, reactable: idea4, user: user5, mode: 'neutral')

        # Reload to update counter caches
        [idea1, idea2, idea3, idea4].each(&:reload)
      end

      it 'returns correct phase_id' do
        expect(results.phase_id).to eq(phase.id)
      end

      it 'returns only the top consensus ideas that reach the consensus threshold' do
        expect(results.top_consensus_ideas).to eq [idea1]
      end

      context 'when there are ties in consensus scores' do
        let!(:idea5) { idea_with_reactions(up: 5) }

        it 'returns the idea with the highest number of votes first' do
          expect(results.top_consensus_ideas).to eq [idea5, idea1]
        end
      end

      it 'returns only the top controversial ideas that stay under the close call threshold' do
        expect(results.top_controversial_ideas).to eq [idea3]
      end

      it 'leaves the ideas between the two thresholds out of both lists' do
        expect(results.top_consensus_ideas).not_to include(idea2)
        expect(results.top_controversial_ideas).not_to include(idea2)
      end

      it 'returns every reacted idea ordered by net agreement (most agreed first)' do
        expect(results.ideas_by_agreement).to eq [idea1, idea2, idea3, idea4]
      end

      it 'does not limit the ideas ordered by net agreement' do
        expect(service.results(1).ideas_by_agreement).to eq [idea1, idea2, idea3, idea4]
      end

      it 'keeps neutral-only reaction counts without treating them as consensus or disagreement' do
        neutral_idea = results.ideas_by_agreement.index_by(&:id).fetch(idea4.id)

        expect(neutral_idea.likes_count).to eq 0
        expect(neutral_idea.dislikes_count).to eq 0
        expect(neutral_idea.neutral_reactions_count).to eq 1
        expect(neutral_idea.agree_percent).to eq 0
        expect(neutral_idea.agreement).to be_nil
        expect(results.top_consensus_ideas).not_to include idea4
        expect(results.top_controversial_ideas).not_to include idea4
      end

      context 'when an idea has more disagree than agree votes' do
        let!(:disagreed_idea) { idea_with_reactions(up: 4, down: 46) }

        it 'orders it after the ideas that lean towards agree' do
          expect(results.ideas_by_agreement).to eq [idea1, idea2, idea3, disagreed_idea, idea4]
        end

        it 'counts it as a highest consensus idea, since the majority is clear' do
          expect(results.top_consensus_ideas).to eq [idea1, disagreed_idea]
        end
      end

      context 'when ideas tie on net agreement' do
        let!(:most_agreed) { idea_with_reactions(up: 20) }
        let!(:least_agreed) { idea_with_reactions(up: 1) }
        let!(:least_disagreed) { idea_with_reactions(down: 1) }
        let!(:most_disagreed) { idea_with_reactions(down: 20) }

        it 'orders the tied ideas by their number of votes, in both directions' do
          expect(results.ideas_by_agreement).to eq [
            most_agreed, idea1, least_agreed, idea2, idea3, least_disagreed, most_disagreed, idea4
          ]
        end
      end

      context 'when many ideas tie on every ordering key' do
        # An even split on idea3's vote count, so no other ordering key can separate them. The
        # number of them matters: on a handful of rows Postgres returns them in id order anyway,
        # and the example below would pass even without the id key.
        let!(:tied_ideas) { Array.new(20) { idea_with_reactions(up: 1, down: 1) } }

        it 'falls back on the idea id, so the order holds from one call to the next' do
          expected_ties = [idea3, *tied_ideas].sort_by(&:id)

          expect(results.ideas_by_agreement.to_a.last(22)).to eq [*expected_ties, idea4]
        end
      end

      context 'when more ideas pass the thresholds than the limit' do
        # Both tie on consensus score with an idea of the base fixture, and win the tie on votes.
        let!(:consensus_idea) { idea_with_reactions(up: 4) }
        let!(:close_call_idea) { idea_with_reactions(up: 2, down: 2) }

        it 'respects the limit parameter' do
          expect(results.top_consensus_ideas).to eq [consensus_idea, idea1]
          expect(results.top_controversial_ideas).to eq [close_call_idea, idea3]

          limited_results = service.results(1)
          expect(limited_results.top_consensus_ideas).to eq [consensus_idea]
          expect(limited_results.top_controversial_ideas).to eq [close_call_idea]
        end
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
          top_consensus_ideas: [idea1],
          top_controversial_ideas: [idea3],
          ideas_by_agreement: [idea1, idea2, idea3, idea4],
          stats: {
            num_participants: 5,
            num_ideas: 4,
            votes: { up: 6, down: 2, neutral: 2 }
          }
        )
      end

      it 'returns the vote counts on the top ideas' do
        expect(results.top_consensus_ideas.map { |idea| [idea.likes_count, idea.dislikes_count, idea.neutral_reactions_count] })
          .to eq([[3, 0, 1]])
      end

      context 'with reactions of admins and moderators' do
        before do
          # Idea1 drops from 1.0 to 0.625 when counting these (3 likes, 5 dislikes)
          create_admins_and_moderators(project: phase.project).each do |user|
            create(:reaction, reactable: idea1, user: user, mode: 'down')
          end
          # Reactions without a known user are kept
          create(:reaction, reactable: idea4, user: nil, mode: 'neutral')
        end

        it 'includes them by default' do
          expect(results.top_consensus_ideas).to be_empty
          expect(results.top_controversial_ideas).to eq [idea3]
          expect(results.ideas_by_agreement).to eq [idea2, idea3, idea1, idea4]
          expect(results.ideas_by_agreement.index_by(&:id).fetch(idea1.id).dislikes_count).to eq 5
          expect(results.stats).to eq({ num_participants: 10, num_ideas: 4, votes: { up: 6, down: 7, neutral: 3 } })
        end

        context 'when excluding admins and moderators' do
          subject(:service) { described_class.new(phase, exclude_admins_and_moderators: true) }

          it 'leaves their reactions out of the rankings, the vote counts and the stats' do
            expect(results.top_consensus_ideas).to eq [idea1]
            expect(results.top_controversial_ideas).to eq [idea3]
            expect(results.ideas_by_agreement).to eq [idea1, idea2, idea3, idea4]
            expect(results.top_consensus_ideas.map { |idea| [idea.likes_count, idea.dislikes_count, idea.neutral_reactions_count] })
              .to eq([[3, 0, 1]])
            expect(results.stats).to eq({ num_participants: 5, num_ideas: 4, votes: { up: 6, down: 2, neutral: 3 } })
          end
        end
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

  describe '#idea_ids_with_agreement' do
    def idea_with_reactions(up: 0, down: 0, neutral: 0)
      create(:idea, project: phase.project, phases: [phase]).tap do |idea|
        create_list(:reaction, up, reactable: idea, mode: 'up')
        create_list(:reaction, down, reactable: idea, mode: 'down')
        create_list(:reaction, neutral, reactable: idea, mode: 'neutral')
      end
    end

    # Neutral reactions count towards the share that agrees.
    let_it_be(:agreed) { idea_with_reactions(up: 3, neutral: 2) } # 60%
    let_it_be(:divided) { idea_with_reactions(up: 2, down: 2, neutral: 1) } # 40%
    let_it_be(:disagreed) { idea_with_reactions(up: 1, down: 2) } # 33%
    let_it_be(:neutral_only) { idea_with_reactions(neutral: 2) }
    let_it_be(:unreacted) { idea_with_reactions }

    where(:agreements, :expected) do
      [
        [%w[agree], [ref(:agreed)]],
        [%w[split], [ref(:divided)]],
        [%w[disagree], [ref(:disagreed)]],
        [%w[agree disagree], [ref(:agreed), ref(:disagreed)]],
        [[], []]
      ]
    end

    with_them do
      it 'returns the ideas in those buckets' do
        expect(Idea.where(id: service.idea_ids_with_agreement(agreements))).to match_array(expected)
      end
    end

    it 'gives each listed idea its agree percentage and bucket' do
      expect(service.results.ideas_by_agreement.to_h { |idea| [idea.id, [idea.agree_percent, idea.agreement]] }).to eq(
        agreed.id => [60, 'agree'], divided.id => [40, 'split'], disagreed.id => [33, 'disagree'],
        neutral_only.id => [0, nil]
      )
    end

    it 'excludes statements without reactions from the full results list' do
      expect(service.results.ideas_by_agreement).not_to include unreacted
    end

    it 'excludes staff reactions from neutral-only counts when requested' do
      admin = create(:admin)
      staff_only = idea_with_reactions
      create(:reaction, reactable: neutral_only, user: admin, mode: 'neutral')
      create(:reaction, reactable: staff_only, user: admin, mode: 'neutral')
      filtered_service = described_class.new(phase, exclude_admins_and_moderators: true)
      neutral_idea = filtered_service.results.ideas_by_agreement.index_by(&:id).fetch(neutral_only.id)

      expect(neutral_idea.neutral_reactions_count).to eq 2
      expect(neutral_idea.agreement).to be_nil
      expect(filtered_service.results.ideas_by_agreement).not_to include staff_only
    end
  end
end
