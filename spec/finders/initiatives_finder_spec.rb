# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable Metrics/BlockLength
describe InitiativesFinder do
  subject(:result) { InitiativesFinder.find(params, **options) }
  let(:record_ids) { result.records.pluck(:id) }
  let(:options) { {} }
  let(:params) { {} }

  before do
    create_list(:initiative, 3)
  end

  describe '#find' do
    context 'without passing params' do
      it 'is successful' do
        expect(result).to be_a_success
      end

      it 'returns all initiatives' do
        expect(result.records.count).to eq Initiative.count
      end

      it 'sorts initiatives by \'new\'' do
        expect(record_ids).to eq Initiative.order_new.pluck(:id)
      end
    end

    context 'when passing a sort param' do
      it 'is successful' do
        params[:sort] = 'some_random_unavailable_method'
        expect(result).to be_a_success
      end

      describe '#new' do
        it 'sorts initiatives by \'new\'' do
          params[:sort] = 'new'
          expect(result).to be_a_success
          expect(record_ids).to eq Initiative.order_new(:desc).pluck(:id)
        end

        it 'sorts initiatives by \'-new\'' do
          params[:sort] = '-new'
          expect(result).to be_a_success
          expect(record_ids).to eq Initiative.order_new(:asc).pluck(:id)
        end
      end

      describe '#status' do
        it 'sorts initiatives by \'status\'' do
          params[:sort] = 'status'
          expect(result).to be_a_success
          expect(record_ids).to eq Initiative.order_status(:asc).pluck(:id)
        end

        it 'sorts initiatives by \'-status\'' do
          params[:sort] = '-status'
          expect(result).to be_a_success
          expect(record_ids).to eq Initiative.order_status(:desc).pluck(:id)
        end
      end

      describe '#upvotes_count' do
        before do
          create(:initiative, upvotes_count: 10)
        end

        it 'sorts initiatives by \'upvotes_count\'' do
          params[:sort] = 'upvotes_count'
          expect(result).to be_a_success
          expect(record_ids).to eq Initiative.order(upvotes_count: :asc).pluck(:id)
        end

        it 'sorts initiatives by \'-upvotes_count\'' do
          params[:sort] = '-upvotes_count'
          expect(result).to be_a_success
          expect(record_ids).to eq Initiative.order(upvotes_count: :desc).pluck(:id)
        end
      end

      describe '#random' do
        it 'sorts initiatives by \'random\'' do
          params[:sort] = 'random'
          expect(result).to be_a_success
          expect(record_ids).to eq Initiative.order_random.pluck(:id)
        end
      end

      describe '#author_name' do
        it 'sorts initiatives by \'author_name\'' do
          params[:sort] = 'author_name'
          options[:includes] = %i[author]
          sorted_ids = Initiative.includes(:author)
                                 .order('users.first_name ASC', 'users.last_name ASC')
                                 .pluck(:id)

          expect(result).to be_a_success
          expect(record_ids).to eq sorted_ids
        end

        it 'sorts initiatives by \'-author_name\'' do
          params[:sort] = '-author_name'
          options[:includes] = %i[author]
          sorted_ids = Initiative.includes(:author)
                                 .order('users.first_name DESC', 'users.last_name DESC')
                                 .pluck(:id)

          expect(result).to be_a_success
          expect(record_ids).to eq sorted_ids
        end

        it 'cannot sort initiatives by \'author_name\' without a join table' do
          params[:sort] = 'author_name'
          expect(result).to be_a_failure
        end

        it 'cannot sort initiatives by \'-author_name\' without a join table' do
          params[:sort] = '-author_name'
          expect(result).to be_a_failure
        end
      end
    end

    context 'when passing filter params' do
      describe '#topics_condition' do
        it 'filters by topics' do
          topic_ids = Topic.limit(3).pluck(:id)
          params[:topics] = topic_ids

          expect(result).to be_a_success
          expect(record_ids).to match_array Initiative.with_some_topics(topic_ids)
        end
      end

      describe '#areas_condition' do
        it 'filters by areas' do
          area_ids = Area.limit(3).pluck(:id)
          params[:areas] = area_ids

          expect(result).to be_a_success
          expect(record_ids).to match_array Initiative.with_some_areas(area_ids)
        end
      end

      describe '#initiative_status_condition' do
        it 'filters by initiative_status' do
          initiative_status_id = InitiativeStatus.first.id
          params[:initiative_status] = initiative_status_id
          filtered_ids = Initiative
                         .left_outer_joins(:initiative_initiative_status)
                         .where('initiative_initiative_statuses.initiative_status_id = ?', initiative_status_id)
                         .pluck(:id)

          expect(result).to be_a_success
          expect(record_ids).to match_array filtered_ids
        end
      end

      describe '#assignee_condition' do
        it 'filters by assignee' do
          assignee_id = create(:user).id
          params[:assignee] = assignee_id

          expect(result).to be_a_success
          expect(record_ids).to match_array Initiative.where(assignee_id: assignee_id).pluck(:id)
        end
      end

      describe '#feedback_needed_condition' do
        let(:initiative_status) { create(:initiative_status) }
        let(:feedback_needed_initiative_status) { create(:initiative_status) }

        before do
          create(:initiative, initiative_status: initiative_status)
          create(:initiative, initiative_status: feedback_needed_initiative_status)
        end

        it 'filters by feedback needed' do
          params[:feedback_needed] = true

          expect(result).to be_a_success
          expect(record_ids).to match_array Initiative.feedback_needed.pluck(:id)
        end

        it 'doesn\'t filter if feedback needed is false' do
          params[:feedback_needed] = false

          expect(result).to be_a_success
          expect(record_ids).to match_array Initiative.pluck(:id)
        end
      end

      describe '#author_condition' do
        let(:author) { create(:user) }

        before do
          create(:initiative, author_id: author.id)
        end

        it 'filters by author' do
          params[:author] = author.id

          expect(result).to be_a_success
          expect(record_ids).to match_array Initiative.where(author_id: author.id).pluck(:id)
        end
      end

      describe '#search_condition' do
        it 'filters by search param' do
          expect(result).to be_a_success
        end
      end

      describe '#publication_status_condition' do
        let(:publication_status) { :closed }

        before do
          create(:initiative, publication_status: publication_status)
        end

        it 'filters by publication_status' do
          params[:publication_status] = publication_status

          expect(result).to be_a_success
          expect(record_ids).to match_array Initiative.where(publication_status: publication_status).pluck(:id)
        end
      end

      describe '#bounding_box_condition' do
        let(:bounding_box) { '[51.208758, 3.224363, 50.000667, 5.715281]' }

        it 'filters by bounding_box' do
          params[:bounding_box] = bounding_box

          expect(result).to be_a_success
          expect(record_ids).to match_array Initiative.with_bounding_box(bounding_box).pluck(:id)
        end
      end

      describe '#initiatives_condition' do
        let(:ids) { Initiative.limit(2).pluck(:id) }

        it 'filters by initiatives' do
          params[:initiatives] = ids

          expect(result).to be_a_success
          expect(record_ids).to match_array Initiative.where(id: ids).pluck(:id)
        end
      end
    end

    context 'with authorize options' do
      let(:user) { create(:user) }
      let(:params) { {} }
      let(:options) { { authorize_with: user } }

      it 'is successful' do
        expect(result).to be_a_success
      end

      it 'returns the initiatives visible to the user' do
        expect(result.records).to match_array Pundit.policy_scope(user, Initiative)
      end
    end
  end
end
# rubocop:enable Metrics/BlockLength
