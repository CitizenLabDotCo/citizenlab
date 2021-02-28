# frozen_string_literal: true

require 'rails_helper'

describe InitiativesFinder do
  subject(:result) { described_class.find(params, **options) }

  let(:record_ids) { result.records.pluck(:id) }
  let(:options) { {} }
  let(:params) { {} }

  before do
    create_list(:initiative, 3)
  end

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

  context 'when passing a sort param \'new\'' do
    before do
      params[:sort] = 'new'
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'sorts initiatives by \'new\'' do
      expect(record_ids).to eq Initiative.order_new(:desc).pluck(:id)
    end
  end

  context 'when passing a sort param \'-new\'' do
    before do
      params[:sort] = '-new'
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'sorts initiatives by \'-new\'' do
      expect(record_ids).to eq Initiative.order_new(:asc).pluck(:id)
    end
  end

  context 'when passing a sort param \'status\'' do
    before do
      params[:sort] = 'status'
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'sorts initiatives by \'status\'' do
      expect(record_ids).to eq Initiative.order_status(:asc).pluck(:id)
    end
  end

  context 'when passing a sort param \'-status\'' do
    before do
      params[:sort] = '-status'
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'sorts initiatives by \'-status\'' do
      expect(record_ids).to eq Initiative.order_status(:desc).pluck(:id)
    end
  end

  context 'when passing a sort param \'upvotes_count\'' do
    before do
      params[:sort] = 'upvotes_count'
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'sorts initiatives by \'upvotes_count\'' do
      expect(record_ids).to eq Initiative.order(upvotes_count: :asc).pluck(:id)
    end
  end

  context 'when passing a sort param \'-upvotes_count\'' do
    before do
      params[:sort] = 'upvotes_count'
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'sorts initiatives by \'-upvotes_count\'' do
      expect(record_ids).to eq Initiative.order(upvotes_count: :desc).pluck(:id)
    end
  end

  context 'when passing a sort param \'author_name\'' do
    before do
      params[:sort] = 'author_name'
      options[:includes] = %i[author]
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'sorts initiatives by \'author_name\'' do
      expect(record_ids).to eq Initiative.includes(:author)
                                         .order('users.first_name ASC', 'users.last_name ASC')
                                         .pluck(:id)
    end

    it 'fails without a join table' do
      options[:includes] = []
      expect(result).to be_a_failure
    end
  end

  context 'when passing a sort param \'-author_name\'' do
    before do
      params[:sort] = '-author_name'
      options[:includes] = %i[author]
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'sorts initiatives by \'author_name\'' do
      expect(record_ids).to eq Initiative.includes(:author)
                                         .order('users.first_name DESC', 'users.last_name DESC')
                                         .pluck(:id)
    end

    it 'fails without a join table' do
      options[:includes] = []
      expect(result).to be_a_failure
    end
  end

  context 'when passing a sort param \'random\'' do
    before do
      params[:sort] = 'random'
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'sorts initiatives by \'random\'' do
      expect(record_ids).to eq Initiative.order_random.pluck(:id)
    end
  end

  describe '#topics_condition' do
    let(:topic_ids) { Topic.limit(3).pluck(:id) }

    before do
      params[:topics] = topic_ids
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'filters by topics' do
      expect(record_ids).to match_array Initiative.with_some_topics(topic_ids)
    end
  end

  describe '#areas_condition' do
    let(:area_ids) { Area.limit(3).pluck(:id) }

    before do
      params[:areas] = area_ids
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'filters by areas' do
      expect(record_ids).to match_array Initiative.with_some_areas(area_ids)
    end
  end

  describe '#initiative_status_condition' do
    let(:initiative_status_id) { InitiativeStatus.first.id }

    before do
      params[:initiative_status] = initiative_status_id
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'filters by initiative_status' do
      filtered_ids = Initiative
                     .left_outer_joins(:initiative_initiative_status)
                     .where(initiative_initiative_statuses: { initiative_status_id: initiative_status_id })
                     .pluck(:id)
      expect(record_ids).to match_array filtered_ids
    end
  end

  describe '#assignee_condition' do
    let(:assignee_id) { create(:user).id }

    before do
      params[:assignee] = assignee_id
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'filters by assignee' do
      expect(record_ids).to match_array Initiative.where(assignee_id: assignee_id).pluck(:id)
    end
  end

  describe '#feedback_needed_condition' do
    let(:initiative_status) { create(:initiative_status) }
    let(:feedback_needed_initiative_status) { create(:initiative_status, code: 'threshold_reached') }

    context 'when true' do
      before do
        create(:initiative, initiative_status: initiative_status)
        create(:initiative, initiative_status: feedback_needed_initiative_status)
        params[:feedback_needed] = true
      end

      it 'is successful' do
        expect(result).to be_a_success
      end

      it 'filters by feedback needed' do
        expect(record_ids).to match_array Initiative.feedback_needed.pluck(:id)
      end
    end

    context 'when false' do
      before do
        create(:initiative, initiative_status: initiative_status)
        create(:initiative, initiative_status: feedback_needed_initiative_status)
        params[:feedback_needed] = false
      end

      it 'is successful' do
        expect(result).to be_a_success
      end

      it 'filters by feedback not needed' do
        expect(record_ids).to match_array Initiative.no_feedback_needed.pluck(:id)
      end
    end
  end

  describe '#author_condition' do
    let(:author) { create(:user) }

    before do
      create(:initiative, author_id: author.id)
      params[:author] = author.id
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'filters by author' do
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
      params[:publication_status] = publication_status
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'filters by publication_status' do
      expect(record_ids).to match_array Initiative.where(publication_status: publication_status).pluck(:id)
    end
  end

  describe '#bounding_box_condition' do
    let(:bounding_box) { '[51.208758, 3.224363, 50.000667, 5.715281]' }

    before do
      params[:bounding_box] = bounding_box
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'filters by bounding_box' do
      expect(record_ids).to match_array Initiative.with_bounding_box(bounding_box).pluck(:id)
    end
  end

  describe '#initiatives_condition' do
    let(:ids) { Initiative.limit(2).pluck(:id) }

    before do
      params[:initiatives] = ids
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'filters by initiatives' do
      expect(record_ids).to match_array Initiative.where(id: ids).pluck(:id)
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
