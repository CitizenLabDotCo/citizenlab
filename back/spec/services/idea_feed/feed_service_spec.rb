# frozen_string_literal: true

require 'rails_helper'

describe IdeaFeed::FeedService do
  subject(:service) { described_class.new(phase, user: user) }

  let(:phase) { create(:idea_feed_phase) }
  let(:user) { create(:user) }

  describe '#top_n' do
    let!(:ideas) { create_list(:idea, 3, project: phase.project, phases: [phase]) }
    let!(:other_idea) { create(:idea) }
    let!(:exposed_idea) { create(:idea, project: phase.project, phases: [phase]) }
    let!(:idea_exposure) { create(:idea_exposure, idea: exposed_idea, user:, phase:) }

    it 'only ever returns published, non-exposed ideas in the given phase' do
      top_3_ideas = service.top_n(5)
      expect(top_3_ideas.size).to eq(3)
      expect(top_3_ideas).to all(be_a(Idea))
      expect(top_3_ideas).to all(satisfy { |idea| idea.phases.include?(phase) })
      expect(top_3_ideas).not_to include(other_idea)
      expect(top_3_ideas).not_to include(exposed_idea)
    end

    it 'ranks more recently published ideas higher, all else being equal' do
      older_idea = ideas[0]
      newer_idea = ideas[1]
      oldest_idea = ideas[2]

      older_idea.update!(published_at: 10.days.ago)
      newer_idea.update!(published_at: 2.days.ago)
      oldest_idea.update!(published_at: 20.days.ago)

      top_3_ideas = service.top_n(3)
      expect(top_3_ideas.first).to eq(newer_idea)
      expect(top_3_ideas.second).to eq(older_idea)
      expect(top_3_ideas.third).to eq(oldest_idea)
    end

    it 'ranks ideas with higher engagement scores higher, all else being equal' do
      low_engagement_idea = ideas[0]
      high_engagement_idea = ideas[1]
      medium_engagement_idea = ideas[2]

      low_engagement_idea.update!(comments_count: 1, likes_count: 0, published_at: 10.days.ago)
      high_engagement_idea.update!(comments_count: 10, likes_count: 20, published_at: 10.days.ago)
      medium_engagement_idea.update!(comments_count: 5, likes_count: 5, published_at: 10.days.ago)

      top_3_ideas = service.top_n(3)
      expect(top_3_ideas.first).to eq(high_engagement_idea)
      expect(top_3_ideas.second).to eq(medium_engagement_idea)
      expect(top_3_ideas.third).to eq(low_engagement_idea)
    end

    it 'ranks ideas with wise voices flags higher, everything else being equal' do
      create(:wise_voice_flag, flaggable: ideas[1])

      top_3_ideas = service.top_n(3)
      expect(top_3_ideas.first).to eq(ideas[1])
    end

    context 'when skip_diversity_sampling is enabled' do
      before do
        settings = AppConfiguration.instance.settings
        settings['idea_feed'] = { 'allowed' => true, 'enabled' => true, 'skip_diversity_sampling' => true }
        AppConfiguration.instance.update!(settings: settings)
      end

      it 'does not call DiversityService' do
        expect(IdeaFeed::DiversityService).not_to receive(:new)
        service.top_n(3)
      end

      it 'returns scored ideas directly' do
        ideas[0].update!(published_at: 20.days.ago)
        ideas[1].update!(published_at: 2.days.ago)
        ideas[2].update!(published_at: 10.days.ago)

        top_3_ideas = service.top_n(3)
        expect(top_3_ideas).to eq([ideas[1], ideas[2], ideas[0]])
      end

      it 'still excludes exposed ideas' do
        top_ideas = service.top_n(5)
        expect(top_ideas).not_to include(exposed_idea)
      end

      context 'when all ideas have been exposed' do
        let!(:ideas) { [] }
        let!(:other_idea) { create(:idea) }
        let!(:exposed_idea) { create(:idea, project: phase.project, phases: [phase]) }
        let!(:idea_exposure) { create(:idea_exposure, idea: exposed_idea, user:, phase:) }

        it 'falls back to least exposed ideas without diversity sampling' do
          expect(IdeaFeed::DiversityService).not_to receive(:new)
          top_ideas = service.top_n(5)
          expect(top_ideas).to contain_exactly(exposed_idea)
        end
      end
    end

    context 'when all ideas have been exposed' do
      let!(:ideas) { [] }
      let!(:other_idea) { create(:idea) }
      let!(:exposed_idea) { create(:idea, project: phase.project, phases: [phase]) }
      let!(:idea_exposure) { create(:idea_exposure, idea: exposed_idea, user:, phase:) }

      it 'returns all ideas in the phase regardless of exposure' do
        top_ideas = service.top_n(5)
        expect(top_ideas).to contain_exactly(exposed_idea)
        expect(top_ideas).not_to include(other_idea)
      end
    end
  end
end
