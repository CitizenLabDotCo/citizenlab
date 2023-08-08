# frozen_string_literal: true

require 'rails_helper'

describe SortByParamsService do
  subject(:service) { described_class.new }

  let(:params) { { sort: sort, phase: phase_id } }
  let(:phase_id) { nil }
  let(:user) { create(:user) }

  describe 'sort_ideas' do
    let(:timeline_project) { create(:project_with_phases) }
    let(:ideas) do
      [
        {
          published_at: Time.now,
          author: create(:user, first_name: 'Sean', last_name: 'Connery'),
          likes_count: 5,
          dislikes_count: 2,
          baskets_count: 1,
          votes_count: 2,
          comments_count: 7,
          budget: 10
        },
        {
          published_at: Time.now - 1.hour,
          author: create(:user, first_name: 'Sean', last_name: 'Penn'),
          likes_count: 3,
          dislikes_count: 5,
          baskets_count: 2,
          votes_count: 4,
          comments_count: 5,
          budget: 20
        },
        {
          published_at: Time.now + 2.days,
          author: create(:user, first_name: 'Jodie', last_name: 'Foster'),
          likes_count: 0,
          dislikes_count: 0,
          baskets_count: 3,
          votes_count: 3,
          comments_count: 2,
          budget: 30
        }
      ].map do |attributes|
        create(:idea, project: timeline_project, **attributes)
      end
    end
    let(:idea_scope) { Idea.where(id: ideas) }
    let(:result_record_ids) { service.sort_ideas(idea_scope, params, user).pluck(:id) }

    describe 'new' do
      let(:sort) { 'new' }
      let(:expected_record_ids) { [ideas[2].id, ideas[0].id, ideas[1].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '-new' do
      let(:sort) { '-new' }
      let(:expected_record_ids) { [ideas[1].id, ideas[0].id, ideas[2].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe do
      before do
        %w[proposed accepted implemented].map.with_index do |code, i|
          create(:idea_status, code: code, ordering: i)
        end
      end

      let(:ideas) do
        [
          IdeaStatus.find_by(code: 'implemented'),
          IdeaStatus.find_by(code: 'proposed'),
          IdeaStatus.find_by(code: 'accepted')
        ].map do |status|
          create(:idea, project: timeline_project, idea_status: status)
        end
      end

      describe 'status' do
        let(:sort) { 'status' }
        let(:expected_record_ids) { [ideas[0].id, ideas[2].id, ideas[1].id] }

        it 'returns the sorted records' do
          expect(result_record_ids).to eq expected_record_ids
        end
      end

      describe '-status' do
        let(:sort) { '-status' }
        let(:expected_record_ids) { [ideas[1].id, ideas[2].id, ideas[0].id] }

        it 'returns the sorted records' do
          expect(result_record_ids).to eq expected_record_ids
        end
      end
    end

    describe 'trending' do
      let(:sort) { 'trending' }

      it 'returns the ids in trending order' do
        sorted_scope = idea_scope.order(created_at: :desc)
        expect_any_instance_of(TrendingIdeaService)
          .to receive(:sort_trending).with(idea_scope).and_return(sorted_scope)
        expect(result_record_ids).to eq(sorted_scope.ids)
      end
    end

    describe '-trending' do
      let(:sort) { '-trending' }

      it 'returns the ids in reverse trending order' do
        sorted_scope = idea_scope.order(created_at: :desc)
        expect_any_instance_of(TrendingIdeaService)
          .to receive(:sort_trending).with(idea_scope).and_return(sorted_scope)
        expect(result_record_ids).to eq(sorted_scope.ids.reverse)
      end
    end

    describe 'author_name' do
      let(:sort) { 'author_name' }
      let(:expected_record_ids) { [ideas[1].id, ideas[0].id, ideas[2].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '-author_name' do
      let(:sort) { '-author_name' }
      let(:expected_record_ids) { [ideas[2].id, ideas[0].id, ideas[1].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe 'popular' do
      let(:sort) { 'popular' }
      let(:expected_record_ids) { [ideas[0].id, ideas[2].id, ideas[1].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '-popular' do
      let(:sort) { '-popular' }
      let(:expected_record_ids) { [ideas[1].id, ideas[2].id, ideas[0].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe 'random' do
      let(:sort) { 'random' }
      let(:expected_record_ids) { Idea.order_random(user).pluck(:id) }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe 'likes_count' do
      let(:sort) { 'likes_count' }
      let(:expected_record_ids) { [ideas[0].id, ideas[1].id, ideas[2].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '-likes_count' do
      let(:sort) { '-likes_count' }
      let(:expected_record_ids) { [ideas[2].id, ideas[1].id, ideas[0].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe 'dislikes_count' do
      let(:sort) { 'dislikes_count' }
      let(:expected_record_ids) { [ideas[1].id, ideas[0].id, ideas[2].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '-dislikes_count' do
      let(:sort) { '-dislikes_count' }
      let(:expected_record_ids) { [ideas[2].id, ideas[0].id, ideas[1].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    context 'not in a phase' do
      describe 'baskets_count' do
        let(:sort) { 'baskets_count' }
        let(:expected_record_ids) { [ideas[2].id, ideas[1].id, ideas[0].id] }

        it 'returns the sorted records' do
          expect(result_record_ids).to eq expected_record_ids
        end
      end

      describe '-baskets_count' do
        let(:sort) { '-baskets_count' }
        let(:expected_record_ids) { [ideas[0].id, ideas[1].id, ideas[2].id] }

        it 'returns the sorted records' do
          expect(result_record_ids).to eq expected_record_ids
        end
      end

      describe 'votes_count' do
        let(:sort) { 'votes_count' }
        let(:expected_record_ids) { [ideas[1].id, ideas[2].id, ideas[0].id] }

        it 'returns the sorted records' do
          expect(result_record_ids).to eq expected_record_ids
        end
      end

      describe '-votes_count' do
        let(:sort) { '-votes_count' }
        let(:expected_record_ids) { [ideas[0].id, ideas[2].id, ideas[1].id] }

        it 'returns the sorted records' do
          expect(result_record_ids).to eq expected_record_ids
        end
      end
    end

    context 'in a phase' do
      let(:project_with_phases) { create(:project_with_phases) }
      let!(:ideas) { create_list(:idea, 3, project: project_with_phases) }
      let!(:ideas_phases) do
        [
          { idea: ideas[0], phase: project_with_phases.phases.first, baskets_count: 5, votes_count: 2 },
          { idea: ideas[1], phase: project_with_phases.phases.first, baskets_count: 2, votes_count: 4 },
          { idea: ideas[2], phase: project_with_phases.phases.first, baskets_count: 3, votes_count: 3 }
        ]
          .map do |attributes|
          create(:ideas_phase, **attributes)
        end
      end
      let(:phase_id) { project_with_phases.phases.first.id }

      describe 'baskets_count' do
        let(:sort) { 'baskets_count' }
        let(:expected_record_ids) { [ideas[0].id, ideas[2].id, ideas[1].id] }

        it 'returns the sorted records' do
          expect(result_record_ids).to eq expected_record_ids
        end
      end

      describe '-baskets_count' do
        let(:sort) { '-baskets_count' }
        let(:expected_record_ids) { [ideas[1].id, ideas[2].id, ideas[0].id] }

        it 'returns the sorted records' do
          expect(result_record_ids).to eq expected_record_ids
        end
      end

      describe 'votes_count' do
        let(:sort) { 'votes_count' }
        let(:expected_record_ids) { [ideas[1].id, ideas[2].id, ideas[0].id] }

        it 'returns the sorted records' do
          expect(result_record_ids).to eq expected_record_ids
        end
      end

      describe '-votes_count' do
        let(:sort) { '-votes_count' }
        let(:expected_record_ids) { [ideas[0].id, ideas[2].id, ideas[1].id] }

        it 'returns the sorted records' do
          expect(result_record_ids).to eq expected_record_ids
        end
      end
    end

    describe 'comments_count' do
      let(:sort) { 'comments_count' }
      let(:expected_record_ids) { [ideas[0].id, ideas[1].id, ideas[2].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '-comments_count' do
      let(:sort) { '-comments_count' }
      let(:expected_record_ids) { [ideas[2].id, ideas[1].id, ideas[0].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe 'budget' do
      let(:sort) { 'budget' }
      let(:expected_record_ids) { [ideas[2].id, ideas[1].id, ideas[0].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '-budget' do
      let(:sort) { '-budget' }
      let(:expected_record_ids) { [ideas[0].id, ideas[1].id, ideas[2].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end
  end

  describe 'sort_initiatives' do
    let(:initiatives) do
      [
        {
          published_at: Time.now,
          author: create(:user, first_name: 'Sean', last_name: 'Connery'),
          likes_count: 5
        },
        {
          published_at: Time.now - 1.hour,
          author: create(:user, first_name: 'Sean', last_name: 'Penn'),
          likes_count: 3
        },
        {
          published_at: Time.now + 2.days,
          author: create(:user, first_name: 'Jodie', last_name: 'Foster'),
          likes_count: 0
        }
      ].map do |attributes|
        create(:initiative, **attributes)
      end
    end
    let(:result_record_ids) { service.sort_initiatives(Initiative.where(id: initiatives.map(&:id)), params, user).pluck(:id) }

    describe 'new' do
      let(:sort) { 'new' }
      let(:expected_record_ids) { [initiatives[2].id, initiatives[0].id, initiatives[1].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '-new' do
      let(:sort) { '-new' }
      let(:expected_record_ids) { [initiatives[1].id, initiatives[0].id, initiatives[2].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe do
      before do
        %w[proposed threshold_reached answered].map.with_index do |code, i|
          create(:initiative_status, code: code, ordering: i)
        end
      end

      let(:initiatives) do
        [
          InitiativeStatus.find_by(code: 'answered'),
          InitiativeStatus.find_by(code: 'proposed'),
          InitiativeStatus.find_by(code: 'threshold_reached')
        ].map do |status|
          create(:initiative, initiative_status: status)
        end
      end

      describe 'status' do
        let(:sort) { 'status' }
        let(:expected_record_ids) { [initiatives[0].id, initiatives[2].id, initiatives[1].id] }

        it 'returns the sorted records' do
          expect(result_record_ids).to eq expected_record_ids
        end
      end

      describe '-status' do
        let(:sort) { '-status' }
        let(:expected_record_ids) { [initiatives[1].id, initiatives[2].id, initiatives[0].id] }

        it 'returns the sorted records' do
          expect(result_record_ids).to eq expected_record_ids
        end
      end
    end

    describe 'author_name' do
      let(:sort) { 'author_name' }
      let(:expected_record_ids) { [initiatives[1].id, initiatives[0].id, initiatives[2].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '-author_name' do
      let(:sort) { '-author_name' }
      let(:expected_record_ids) { [initiatives[2].id, initiatives[0].id, initiatives[1].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe 'random' do
      let(:sort) { 'random' }
      let(:expected_record_ids) { Initiative.order_random(user).pluck(:id) }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe 'likes_count' do
      let(:sort) { 'likes_count' }
      let(:expected_record_ids) { [initiatives[0].id, initiatives[1].id, initiatives[2].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '-likes_count' do
      let(:sort) { '-likes_count' }
      let(:expected_record_ids) { [initiatives[2].id, initiatives[1].id, initiatives[0].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end
  end

  describe 'sort_events' do
    let(:events) do
      [Time.zone.today, (Time.zone.today - 1.day), (Time.zone.today + 2.months)].map do |start_at|
        create(:event, start_at: start_at, end_at: (Time.zone.today + 3.months))
      end
    end
    let(:result_record_ids) { service.sort_events(Event.where(id: events.map(&:id)), params).pluck(:id) }

    describe 'default behaviour' do
      let(:sort) { nil }
      let(:expected_record_ids) { [events[2].id, events[0].id, events[1].id] }

      it 'returns the records sorted by start_at' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe 'start_at' do
      let(:sort) { 'start_at' }
      let(:expected_record_ids) { [events[2].id, events[0].id, events[1].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '-start_at' do
      let(:sort) { '-start_at' }
      let(:expected_record_ids) { [events[1].id, events[0].id, events[2].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end
  end

  describe 'sort_activities' do
    let(:activities) do
      [Time.now, (Time.now - 2.minutes), (Time.now + 1.month)].map do |acted_at|
        create(:activity, acted_at: acted_at)
      end
    end
    let(:result_record_ids) { service.sort_activities(Activity.where(id: activities.map(&:id)), params).pluck(:id) }

    describe 'default behaviour' do
      let(:sort) { nil }
      let(:expected_record_ids) { [activities[1].id, activities[0].id, activities[2].id] }

      it 'returns the records sorted by -acted_at' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe 'acted_at' do
      let(:sort) { 'acted_at' }
      let(:expected_record_ids) { [activities[2].id, activities[0].id, activities[1].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '-acted_at' do
      let(:sort) { '-acted_at' }
      let(:expected_record_ids) { [activities[1].id, activities[0].id, activities[2].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end
  end
end
