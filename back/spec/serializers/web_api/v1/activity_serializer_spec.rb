# frozen_string_literal: true

require 'rails_helper'

describe WebApi::V1::ActivitySerializer do
  include SideFxHelper

  context 'item_title_multiloc' do
    let(:expected_title) { { 'en' => 'Idea title' } }
    let(:idea) { create(:idea, title_multiloc: expected_title) }
    let(:activity) do
      create(:idea_created_activity, item: idea, payload: { idea: clean_time_attributes(idea.attributes) })
    end

    context 'when the item exists' do
      it "returns the item's title multiloc" do
        serialized_output = described_class.new(activity).serializable_hash
        expect(serialized_output.dig(:data, :attributes, :item_title_multiloc)).to match expected_title
      end
    end

    context 'when the item has been deleted' do
      it "returns the item's title multiloc" do
        idea.destroy!
        expect(activity.reload&.item&.title_multiloc).to be_nil

        serialized_output = described_class.new(activity.reload).serializable_hash
        expect(serialized_output.dig(:data, :attributes, :item_title_multiloc)).to match expected_title
      end
    end
  end

  context 'item_exists' do
    let(:idea) { create(:idea) }
    let(:activity) { create(:idea_created_activity, item: idea) }

    it 'returns true when the item exists' do
      serialized_output = described_class.new(activity.reload).serializable_hash
      expect(serialized_output.dig(:data, :attributes, :item_exists)).to be true
    end

    it 'returns false when the item does not exist' do
      idea.destroy!
      expect(activity.reload&.item).to be_nil

      serialized_output = described_class.new(activity.reload).serializable_hash
      expect(serialized_output.dig(:data, :attributes, :item_exists)).to be false
    end
  end
end
