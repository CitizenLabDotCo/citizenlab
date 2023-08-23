# frozen_string_literal: true

require 'rails_helper'

describe SideFxCustomFieldService do
  let(:service) { described_class.new }
  let(:user) { build(:user) }

  describe 'before_delete' do
    let!(:custom_field1) { create(:custom_field) }
    let!(:custom_field2) { create(:custom_field) }
    let!(:analysis) { create(:analysis, custom_fields: [custom_field1, custom_field2]) }
    let!(:insight1) { create(:insight, analysis: analysis, filters: { "author_custom_#{custom_field1.id}" => [], 'votes_from' => 4 }) }
    let!(:insight2) { create(:insight, analysis: analysis, filters: { "author_custom_#{custom_field1.id}_from" => 5, "author_custom_#{custom_field2.id}_from" => 5 }) }
    let!(:insight3) { create(:insight, analysis: analysis, filters: {}) }

    it 'deletes the custom field reference from the insight filters', document: false do
      service.before_destroy(custom_field1, user)

      expect(insight1.reload.filters).to eq({ 'votes_from' => 4 })
      expect(insight2.reload.filters).to eq({ "author_custom_#{custom_field2.id}_from" => 5 })
      expect(insight3.reload.filters).to eq({})
    end
  end
end
