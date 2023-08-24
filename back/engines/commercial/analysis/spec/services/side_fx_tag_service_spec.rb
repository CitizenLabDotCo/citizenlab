# frozen_string_literal: true

require 'rails_helper'

describe Analysis::SideFxTagService do
  let(:service) { described_class.new }
  let(:user) { build(:user) }

  describe 'before_delete' do
    let!(:tag1) { create(:tag) }
    let!(:tag2) { create(:tag, analysis: tag1.analysis) }
    let!(:insight1) { create(:insight, analysis: tag1.analysis, filters: { 'tag_ids' => [tag1.id] }) }
    let!(:insight2) { create(:insight, analysis: tag1.analysis, filters: { 'tag_ids' => [tag1.id, tag2.id] }) }
    let!(:insight3) { create(:insight, analysis: tag1.analysis, filters: {}) }

    it 'deletes the tag from the insight filters', document: false do
      service.before_destroy(tag1, user)

      expect(insight1.reload.filters['tag_ids']).to eq([])
      expect(insight2.reload.filters['tag_ids']).to eq([tag2.id])
      expect(insight3.reload.filters).to eq({})
    end
  end
end
