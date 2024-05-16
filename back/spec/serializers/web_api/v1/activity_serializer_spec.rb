# frozen_string_literal: true

require 'rails_helper'

describe WebApi::V1::ActivitySerializer do
  include SideFxHelper

  context 'item_title_multiloc' do
    let(:expected_title) { { 'en' => 'Idea title' } }
    let(:idea) { create(:idea, title_multiloc: expected_title) }
    let(:activity) { create(:idea_created_activity, item: idea) }

    context 'when the item exists' do
      it "returns the item's title multiloc" do
        serialized_output = described_class.new(activity).serializable_hash
        expect(serialized_output.dig(:data, :attributes, :item_title_multiloc)).to match expected_title
      end
    end

    context 'when the item has been deleted' do
      it "returns the item's title multiloc from the activity payload data" do
        serialized_idea = clean_time_attributes(idea.attributes)
        activity = create(:idea_created_activity, item: idea, payload: { idea: serialized_idea })
        idea.destroy!

        serialized_output = described_class.new(activity.reload).serializable_hash
        expect(serialized_output.dig(:data, :attributes, :item_title_multiloc)).to match expected_title
      end

      it "returns nil for the item's title multiloc if not found in activity payload data" do
        activity = create(:idea_created_activity, item: idea, payload: {})
        idea.destroy!

        serialized_output = described_class.new(activity.reload).serializable_hash
        expect(serialized_output.dig(:data, :attributes, :item_title_multiloc)).to be_nil
      end
    end
  end
end
