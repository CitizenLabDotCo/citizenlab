# frozen_string_literal: true

require 'rails_helper'

describe InitiativesFinder do
  subject(:finder) { described_class.new(params, **options) }

  let(:record_ids) { finder.find_records.pluck(:id) }
  let(:options) { {} }
  let(:params) { {} }

  before { create_list(:initiative, 3, assignee: create(:admin)) }

  context 'without passing params' do
    it 'returns all initiatives' do
      expect(finder.find_records.count).to eq Initiative.count
    end
  end

  describe '#find_records' do
    let(:normal_user) { create(:user) }

    let(:options) do
      {
        scope: InitiativePolicy::Scope.new(normal_user, Initiative).resolve
      }
    end

    before do
      users = User.all
      Initiative.first.cosponsors << users[0]
      Initiative.first.cosponsors << users[1]
    end

    it 'does not return duplicate records' do
      expect(record_ids).to match_array Initiative.all.pluck(:id).uniq
    end
  end

  describe '#topics_condition' do
    let(:topic_ids) { Topic.limit(3).pluck(:id) }

    before do
      params[:topics] = topic_ids
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

    it 'filters by areas' do
      expect(record_ids).to match_array Initiative.with_some_areas(area_ids)
    end
  end

  describe '#initiative_status_condition' do
    let(:initiative_status_id) { InitiativeStatus.first.id }

    before do
      params[:initiative_status] = initiative_status_id
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
    let(:assignee) { create(:admin) }
    let!(:unassigned_initiatives) { create_list(:initiative, 2, assignee: nil) }
    let!(:assigned_initiatives) { create_list(:initiative, 3, assignee: assignee) }

    describe 'filtering on an assignee ID' do
      let(:params) { { assignee: assignee.id } }

      it 'returns the correct records' do
        expect(record_ids).to match_array assigned_initiatives.map(&:id)
      end
    end

    describe 'filtering on unassigned' do
      let(:params) { { assignee: 'unassigned' } }

      it 'returns the correct records' do
        expect(record_ids).to match_array unassigned_initiatives.map(&:id)
      end
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

    it 'filters by author' do
      expect(record_ids).to match_array Initiative.where(author_id: author.id).pluck(:id)
    end
  end

  describe '#search_condition' do
    let(:slug) { 'slug_1' }
    let(:expected_record_ids) { Initiative.search_by_all(slug).pluck(:id) }

    before do
      params[:search] = slug
    end

    it 'returns the correct records' do
      create(:initiative, slug: slug)
      expect(record_ids).to match_array expected_record_ids
    end
  end

  describe '#publication_status_condition' do
    let(:publication_status) { :published }

    before do
      create(:initiative, publication_status: publication_status)
      params[:publication_status] = publication_status
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

    it 'filters by bounding_box' do
      expect(record_ids).to match_array Initiative.with_bounding_box(bounding_box).pluck(:id)
    end
  end

  describe '#initiatives_condition' do
    let(:ids) { Initiative.limit(2).pluck(:id) }

    before do
      params[:initiatives] = ids
    end

    it 'filters by initiatives' do
      expect(record_ids).to match_array Initiative.where(id: ids).pluck(:id)
    end
  end
end
