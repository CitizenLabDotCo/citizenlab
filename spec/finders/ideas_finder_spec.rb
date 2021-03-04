# frozen_string_literal: true

require 'rails_helper'

describe IdeasFinder do
  subject(:result) { described_class.find(params, **options) }

  let(:params) { {} }
  let(:options) { {} }
  let(:result_record_ids) { result.records.pluck(:id) }

  before do
    create_list(:idea_with_topics, 5, project: create(:project_with_phases))
    create_list(:idea_with_areas, 5, project: create(:project_with_phases))
  end

  context 'when no params or options are received' do
    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'returns all' do
      expect(result.count).to eq Idea.count
    end
  end

  describe '#projects_condition' do
    let(:project_ids) { [Project.first.id] }
    let(:expected_record_ids) { Idea.where(project_id: project_ids).pluck(:id) }

    before do
      params[:projects] = project_ids
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#project_condition' do
    let(:project_id) { Project.pick(:id) }
    let(:expected_record_ids) { Idea.where(project_id: project_id).pluck(:id) }

    before do
      params[:project] = project_id
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#topics_condition' do
    let(:topic_ids) { Topic.first(2).pluck(:id) }
    let(:expected_record_ids) do
      Idea.includes(:ideas_topics).where(ideas_topics: { topic_id: topic_ids }).distinct.pluck(:id)
    end

    before do
      params[:topics] = topic_ids
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#areas_condition' do
    let(:area_ids) { Area.first(2).pluck(:id) }
    let(:expected_record_ids) do
      Idea.includes(:areas_ideas).where(areas_ideas: { area_id: area_ids }).distinct.pluck(:id)
    end

    before do
      params[:areas] = area_ids
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#phase_condition' do
    let(:phase_id) { Phase.pick(:id) }
    let(:expected_record_ids) { Idea.includes(:ideas_phases).where(ideas_phases: { phase_id: phase_id }).pluck(:id) }

    before do
      params[:phase] = phase_id
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#idea_status_condition' do
    let(:idea_status_id) { IdeaStatus.pick(:id) }
    let(:expected_record_ids) { Idea.where(idea_status_id: idea_status_id).pluck(:id) }

    before do
      params[:idea_status] = idea_status_id
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#project_publication_status_condition' do
    let(:publication_status) { 'draft' }
    let(:expected_record_ids) do
      Idea.includes(project: :admin_publication)
          .where(projects: { admin_publications: { publication_status: publication_status } })
          .pluck(:id)
    end

    before do
      params[:project_publication_status] = publication_status
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#feedback_needed_condition' do
    let(:expected_record_ids) { Idea.feedback_needed.pluck(:id) }

    before do
      params[:feedback_needed] = true
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#search_condition' do
    let(:first_idea_title) { Idea.first.title_multiloc['en'] }
    let(:expected_record_ids) { Idea.search_by_all(first_idea_title).pluck(:id) }

    before do
      params[:search] = first_idea_title
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#bounding_box_condition' do
    let(:bounding_box) { '[51.208758,3.224363,50.000667,5.715281]' }
    let(:expected_record_ids) { Idea.with_bounding_box(bounding_box).pluck(:id) }

    before do
      params[:bounding_box] = bounding_box
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#filter_trending_condition' do
    let(:expected_record_ids) { TrendingIdeaService.new.filter_trending(Idea.joins(:idea_trending_info)).pluck(:id) }

    before do
      params[:filter_trending] = true
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#author_condition' do
    let(:author_id) { User.first.id }
    let(:expected_record_ids) { Idea.where(author_id: author_id).pluck(:id) }

    before do
      params[:author] = author_id
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#publication_status_condition' do
    let(:publication_status) { 'draft' }
    let(:expected_record_ids) { Idea.where(publication_status: publication_status).pluck(:id) }

    before do
      params[:publication_status] = publication_status
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end
end
