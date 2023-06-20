# frozen_string_literal: true

require 'rails_helper'

describe SortByParams do
  subject(:service) { described_class.new }

  let(:timeline_project) { create(:project_with_phases) }
  let(:ideas) do
    [
      {
        published_at: Time.now,
        author: create(:user, first_name: 'Sean', last_name: 'Connery'),
        upvotes_count: 5,
        downvotes_count: 2,
        baskets_count: 1
      },
      {
        published_at: Time.now - 1.hour,
        author: create(:user, first_name: 'Sean', last_name: 'Penn'),
        upvotes_count: 3,
        downvotes_count: 5,
        baskets_count: 2
      },
      {
        published_at: Time.now + 2.days,
        author: create(:user, first_name: 'Jodie', last_name: 'Foster'),
        upvotes_count: 0,
        downvotes_count: 0,
        baskets_count: 3
      }
    ].map do |attributes|
      create(:idea, project: timeline_project, **attributes)
    end
  end
  let(:params) { {} }
  let(:user) { create(:user) }
  let(:result_record_ids) { service.sort_ideas(Idea.where(id: ideas.map(&:id)), params, user).pluck(:id) }

  context 'when passing a sort param' do
    let(:params) { { sort: sort } }

    describe '#sort_scopes (new)' do
      let(:sort) { 'new' }
      let(:expected_record_ids) { [ideas[2].id, ideas[0].id, ideas[1].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '#sort_scopes (-new)' do
      let(:sort) { '-new' }
      let(:expected_record_ids) { [ideas[1].id, ideas[0].id, ideas[2].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe do
      before { %w[proposed accepted implemented].map { |code| create(:idea_status, code: code) } }

      let(:ideas) do
        [
          {
            idea_status: IdeaStatus.find_by(code: 'implemented')
          },
          {
            idea_status: IdeaStatus.find_by(code: 'proposed')
          },
          {
            idea_status: IdeaStatus.find_by(code: 'accepted')
          }
        ].map do |attributes|
          create(:idea, project: timeline_project, **attributes)
        end
      end

      describe '#sort_scopes (status)' do
        let(:sort) { 'status' }
        let(:expected_record_ids) { [ideas[1].id, ideas[2].id, ideas[0].id] }

        it 'returns the sorted records' do
          expect(result_record_ids).to eq expected_record_ids
        end
      end

      describe '#sort_scopes (-status)' do
        let(:sort) { '-status' }
        let(:expected_record_ids) { [ideas[0].id, ideas[2].id, ideas[1].id] }

        it 'returns the sorted records' do
          expect(result_record_ids).to eq expected_record_ids
        end
      end
    end

    describe '#sort_scopes (trending)' do
      let(:sort) { 'trending' }

      it 'returns the ids in trending order' do
        allow_any_instance_of(TrendingIdeaService).to receive(:sort_trending).with(ideas).and_return ideas
        expect(result_record_ids).to eq ideas.map(&:id)
      end
    end

    describe '#sort_scopes (-trending)' do
      let(:sort) { '-trending' }

      it 'returns the ids in reverse trending order' do
        allow_any_instance_of(TrendingIdeaService).to receive(:sort_trending).with(ideas).and_return ideas
        expect(result_record_ids).to eq ideas.map(&:id).reverse
      end
    end

    describe '#sort_scopes (author_name)' do
      let(:sort) { 'author_name' }
      let(:expected_record_ids) { [ideas[1].id, ideas[0].id, ideas[2].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '#sort_scopes (-author_name)' do
      let(:sort) { '-author_name' }
      let(:expected_record_ids) { [ideas[2].id, ideas[0].id, ideas[1].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '#sort_scopes (popular)' do
      let(:sort) { 'popular' }
      let(:expected_record_ids) { [ideas[0].id, ideas[2].id, ideas[1].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '#sort_scopes (-popular)' do
      let(:sort) { '-popular' }
      let(:expected_record_ids) { [ideas[1].id, ideas[2].id, ideas[0].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '#sort_scopes (random)' do
      let(:sort) { 'random' }
      let(:expected_record_ids) { Idea.order_random(user).pluck(:id) }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '#sortable_attributes (upvotes_count)' do
      let(:sort) { 'upvotes_count' }
      let(:expected_record_ids) { [ideas[0].id, ideas[1].id, ideas[2].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '#sortable_attributes (-upvotes_count)' do
      let(:sort) { '-upvotes_count' }
      let(:expected_record_ids) { [ideas[2].id, ideas[1].id, ideas[0].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '#sortable_attributes (downvotes_count)' do
      let(:sort) { 'downvotes_count' }
      let(:expected_record_ids) { [ideas[1].id, ideas[0].id, ideas[2].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '#sortable_attributes (-downvotes_count)' do
      let(:sort) { '-downvotes_count' }
      let(:expected_record_ids) { [ideas[2].id, ideas[0].id, ideas[1].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '#sortable_attributes (baskets_count)' do
      let(:sort) { 'baskets_count' }
      let(:expected_record_ids) { [ideas[2].id, ideas[1].id, ideas[0].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end

    describe '#sortable_attributes (-baskets_count)' do
      let(:sort) { '-baskets_count' }
      let(:expected_record_ids) { [ideas[0].id, ideas[1].id, ideas[2].id] }

      it 'returns the sorted records' do
        expect(result_record_ids).to eq expected_record_ids
      end
    end
  end
end
