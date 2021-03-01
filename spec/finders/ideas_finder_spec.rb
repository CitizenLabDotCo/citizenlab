# frozen_string_literal: true

require 'rails_helper'

describe IdeasFinder do
  subject(:result) { described_class.find(params, **options) }

  let(:params) { {} }
  let(:options) { {} }
  let(:result_record_ids) { result.records.pluck(:id) }

  before do
    create_list(:idea, 5)
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
    let(:expected_record_ids) { Idea.all.pluck(:id) }

    before do
      params[:projects] = 'projects'
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#topics_condition' do
    let(:expected_record_ids) { Idea.all.pluck(:id) }

    before do
      params[:topics] = 'topics'
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#areas_condition' do
    let(:expected_record_ids) { Idea.all.pluck(:id) }

    before do
      params[:areas] = 'areas'
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#phase_condition' do
    let(:expected_record_ids) { Idea.all.pluck(:id) }

    before do
      params[:phase] = 'phase'
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#idea_status_condition' do
    let(:expected_record_ids) { Idea.all.pluck(:id) }

    before do
      params[:idea_status] = 'idea_status'
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#project_publication_status_condition' do
    let(:expected_record_ids) { Idea.all.pluck(:id) }

    before do
      params[:project_publication_status] = 'project_publication_status'
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#feedback_needed_condition' do
    let(:expected_record_ids) { Idea.all.pluck(:id) }

    before do
      params[:feedback_needed] = 'feedback_needed'
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#search_condition' do
    let(:expected_record_ids) { Idea.all.pluck(:id) }

    before do
      params[:search] = 'search'
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#filter_trending_condition' do
    let(:expected_record_ids) { Idea.all.pluck(:id) }

    before do
      params[:filter_trending] = 'filter_trending'
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#author_condition' do
    let(:expected_record_ids) { Idea.all.pluck(:id) }

    before do
      params[:author] = 'author'
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end

  describe '#publication_status_condition' do
    let(:expected_record_ids) { Idea.all.pluck(:id) }

    before do
      params[:publication_status] = 'publication_status'
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end
end
