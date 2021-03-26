# frozen_string_literal: true

require 'rails_helper'

describe IdeasFinder do
  subject(:result) { described_class.find(params, **options) }

  let(:params) { {} }
  let(:options) { {} }
  let(:result_record_ids) { result.records.pluck(:id) }
  let(:assignee) { create(:admin) }

  before do
    create_list(:idea, 5)
    create_list(:assigned_idea, 3, assignee: assignee)
  end

  describe '#assignee_condition' do
    let(:expected_record_ids) { Idea.where(assignee_id: assignee.id).pluck(:id) }

    before do
      params[:assignee] = assignee.id
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'returns the correct records' do
      expect(result_record_ids).to match_array expected_record_ids
    end
  end
end
