# frozen_string_literal: true

require 'rails_helper'

describe Analysis::SideFxTagService do
  let(:service) { described_class.new }
  let(:user) { build(:user) }

  describe 'before_delete' do
    let_it_be(:tag1) { create(:tag) }
    let_it_be(:tag2) { create(:tag, analysis: tag1.analysis) }
    let_it_be(:insight1) { create(:insight, analysis: tag1.analysis, filters: { 'tag_ids' => [tag1.id] }) }
    let_it_be(:insight2) { create(:insight, analysis: tag1.analysis, filters: { 'tag_ids' => [tag1.id, tag2.id] }) }
    let_it_be(:insight3) { create(:insight, analysis: tag1.analysis, filters: {}) }
    let_it_be(:auto_tagging_task) { create(:auto_tagging_task, analysis: tag1.analysis, filters: { 'tag_ids' => [tag1.id] }) }

    it 'deletes the tag from the insight filters', document: false do
      service.before_destroy(tag1, user)

      expect(insight1.reload.filters['tag_ids']).to eq([])
      expect(insight2.reload.filters['tag_ids']).to eq([tag2.id])
      expect(insight3.reload.filters).to eq({})
    end

    it 'deletes the tag from the auto_taggings_task filters', document: false do
      service.before_destroy(tag1, user)

      expect(auto_tagging_task.reload.filters['tag_ids']).to eq([])
    end
  end
end
