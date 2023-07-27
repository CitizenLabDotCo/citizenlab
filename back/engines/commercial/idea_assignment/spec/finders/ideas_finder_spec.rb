# frozen_string_literal: true

require 'rails_helper'

describe IdeasFinder do
  subject(:result) { described_class.new(params, **options) }

  let(:options) { {} }
  let(:result_record_ids) { result.find_records.pluck(:id) }
  let(:assignee) { create(:admin) }
  let!(:unassigned_ideas) { create_list(:idea, 2) }
  let!(:assigned_ideas) { create_list(:idea, 3, assignee: assignee) }

  describe '#assignee_condition' do
    describe 'filtering on an assignee ID' do
      let(:params) { { assignee: assignee.id } }

      it 'returns the correct records' do
        expect(result_record_ids).to match_array assigned_ideas.map(&:id)
      end
    end

    describe 'filtering on unassigned' do
      let(:params) { { assignee: 'unassigned' } }

      it 'returns the correct records' do
        expect(result_record_ids).to match_array unassigned_ideas.map(&:id)
      end
    end
  end
end
