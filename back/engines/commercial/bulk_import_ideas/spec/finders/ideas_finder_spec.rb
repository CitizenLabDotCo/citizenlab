# frozen_string_literal: true

require 'rails_helper'

describe IdeasFinder do
  subject(:result) { described_class.new(params) }

  let(:result_record_ids) { result.find_records.pluck(:id) }
  let!(:online_ideas) { create_list(:idea, 2) }
  let!(:imported_idea) { create(:idea_import).idea }

  describe '#imported_condition' do
    context 'when true' do
      let(:params) { { imported: 'true' } }

      it 'returns the imported ideas' do
        expect(result_record_ids).to eq [imported_idea.id]
      end
    end

    context 'when false' do
      let(:params) { { imported: 'false' } }

      it 'returns the ideas that were not imported' do
        expect(result_record_ids).to match_array online_ideas.map(&:id)
      end
    end

    context 'when absent' do
      let(:params) { {} }

      it 'returns all ideas' do
        expect(result_record_ids).to match_array [*online_ideas, imported_idea].map(&:id)
      end
    end
  end
end
