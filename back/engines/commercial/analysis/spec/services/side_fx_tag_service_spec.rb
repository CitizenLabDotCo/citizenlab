# frozen_string_literal: true

require 'rails_helper'

describe Analysis::SideFxTagService do
  let(:service) { described_class.new }
  let(:user) { build(:user) }

  describe 'before_delete' do
    let!(:tag1) { create(:tag) }
    let!(:tag2) { create(:tag, analysis: tag1.analysis) }
    let!(:summary1) { create(:summary, analysis: tag1.analysis, filters: { 'tag_ids' => [tag1.id] }) }
    let!(:summary2) { create(:summary, analysis: tag1.analysis, filters: { 'tag_ids' => [tag1.id, tag2.id] }) }
    let!(:summary3) { create(:summary, analysis: tag1.analysis, filters: {}) }

    it 'deletes the tag from the summary filters', document: false do
      service.before_destroy(tag1, user)

      expect(summary1.reload.filters['tag_ids']).to eq([])
      expect(summary2.reload.filters['tag_ids']).to eq([tag2.id])
      expect(summary3.reload.filters).to eq({})
    end
  end
end
