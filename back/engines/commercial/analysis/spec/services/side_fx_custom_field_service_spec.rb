# frozen_string_literal: true

require 'rails_helper'

describe SideFxCustomFieldService do
  let(:service) { described_class.new }
  let(:user) { build(:user) }

  describe 'before_delete' do
    let_it_be(:custom_field1) { create(:custom_field) }
    let_it_be(:custom_field2) { create(:custom_field) }
    let_it_be(:analysis) { create(:analysis, custom_fields: [custom_field1, custom_field2]) }
    let_it_be(:insight1) { create(:insight, analysis: analysis, filters: { "author_custom_#{custom_field1.id}" => [], 'votes_from' => 4 }) }
    let_it_be(:insight2) { create(:insight, analysis: analysis, filters: { "author_custom_#{custom_field1.id}_from" => 5, "author_custom_#{custom_field2.id}_from" => 5 }) }
    let_it_be(:insight3) { create(:insight, analysis: analysis, filters: {}) }
    let_it_be(:auto_tagging_task) { create(:auto_tagging_task, analysis: analysis, filters: { "input_custom_#{custom_field2.id}" => [] }) }

    it 'deletes the custom field reference from the insight filters', document: false do
      service.before_destroy(custom_field1, user)

      expect(insight1.reload.filters).to eq({ 'votes_from' => 4 })
      expect(insight2.reload.filters).to eq({ "author_custom_#{custom_field2.id}_from" => 5 })
      expect(insight3.reload.filters).to eq({})
    end

    it 'deletes the custom field reference from the auto_tagging_task filters', document: false do
      service.before_destroy(custom_field2, user)

      expect(auto_tagging_task.reload.filters).to eq({})
    end
  end
end
