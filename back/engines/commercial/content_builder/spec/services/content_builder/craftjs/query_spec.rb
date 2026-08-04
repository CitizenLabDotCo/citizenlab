# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ContentBuilder::Craftjs::Query do
  describe '.ordered_slots' do
    it 'returns declared slots in visual order regardless of stored key order' do
      node = craftjs_node('TwoColumn', parent: 'ROOT', linkedNodes: { 'right' => 'R', 'left' => 'L' })

      expect(described_class.ordered_slots(node)).to eq(%w[left right])
    end

    it 'omits declared slots the node does not carry' do
      node = craftjs_node('TwoColumn', parent: 'ROOT', linkedNodes: { 'right' => 'R' })

      expect(described_class.ordered_slots(node)).to eq(%w[right])
    end

    it 'appends slots missing from the widget registry after the declared ones' do
      node = craftjs_node('TwoColumn', parent: 'ROOT', linkedNodes: { 'middle' => 'M', 'left' => 'L' })

      expect(described_class.ordered_slots(node)).to eq(%w[left middle])
    end

    it 'keeps stored order for widgets with no declared slots' do
      node = craftjs_node('LegacyWidget', parent: 'ROOT', linkedNodes: { 'b' => 'B', 'a' => 'A' })

      expect(described_class.ordered_slots(node)).to eq(%w[b a])
    end
  end
end
