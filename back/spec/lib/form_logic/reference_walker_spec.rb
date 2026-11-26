# frozen_string_literal: true

require 'rails_helper'

RSpec.describe FormLogic::ReferenceWalker do
  def leaf(field, op, value = :none)
    value == :none ? { 'field' => field, 'op' => op } : { 'field' => field, 'op' => op, 'value' => value }
  end

  let(:page_logic) do
    {
      'jumps' => [
        { 'when' => leaf('colour', 'one_of', %w[red blue]), 'goto' => 'p3' },
        { 'when' => { 'all' => [leaf('tags', 'contains_all', %w[a b]), { 'not' => leaf('score', 'gte', 3) }] }, 'goto' => 'end' },
        { 'when' => leaf('colour', 'none_of', %w[red]), 'goto' => 'p4' }
      ],
      'next' => 'p2'
    }
  end
  let(:question_logic) do
    { 'display' => { 'any' => [leaf('colour', 'one_of', %w[red]), leaf('tags', 'contains_any', %w[b])] }, 'required_if' => leaf('score', 'absent') }
  end

  describe '.references' do
    it 'lists every field, option and page the logic points to' do
      expect(described_class.references(page_logic)).to eq(
        fields: %w[colour tags score], options: %w[red blue a b], pages: %w[p3 p4 p2]
      )
      expect(described_class.references(question_logic)).to eq(fields: %w[colour tags score], options: %w[red b], pages: [])
    end

    it 'does not count end, numbers or null targets' do
      expect(described_class.references('jumps' => [{ 'when' => leaf('s', 'one_of', [1, 2]), 'goto' => 'end' }], 'next' => nil))
        .to eq(fields: %w[s], options: [], pages: [])
    end

    it 'is empty for no logic' do
      expect(described_class.references({})).to eq(fields: [], options: [], pages: [])
    end
  end

  describe '.remap' do
    it 'replaces every field, option and page id in the map' do
      map = { 'colour' => 'colour2', 'red' => 'red2', 'p3' => 'p3b', 'p2' => 'p2b', 'tags' => 'tags2', 'a' => 'a2' }

      expect(described_class.remap(page_logic, map)).to eq(
        'jumps' => [
          { 'when' => leaf('colour2', 'one_of', %w[red2 blue]), 'goto' => 'p3b' },
          { 'when' => { 'all' => [leaf('tags2', 'contains_all', %w[a2 b]), { 'not' => leaf('score', 'gte', 3) }] }, 'goto' => 'end' },
          { 'when' => leaf('colour2', 'none_of', %w[red2]), 'goto' => 'p4' }
        ],
        'next' => 'p2b'
      )
    end

    it 'does not touch numbers, end or the original' do
      logic = { 'jumps' => [{ 'when' => leaf('s', 'eq', 3), 'goto' => 'end' }] }
      original = logic.deep_dup

      expect(described_class.remap(logic, { '3' => 'x', 'end' => 'p9', 's' => 's2' })).to eq(
        'jumps' => [{ 'when' => leaf('s2', 'eq', 3), 'goto' => 'end' }]
      )
      expect(logic).to eq(original)
    end

    it 'remaps question logic' do
      expect(described_class.remap(question_logic, { 'red' => 'r', 'score' => 's' })).to eq(
        'display' => { 'any' => [leaf('colour', 'one_of', %w[r]), leaf('tags', 'contains_any', %w[b])] }, 'required_if' => leaf('s', 'absent')
      )
    end
  end

  describe '.drop_option' do
    it 'removes the option from one_of, none_of and contains_any lists' do
      expect(described_class.drop_option(page_logic, 'blue')['jumps'].first['when']).to eq(leaf('colour', 'one_of', %w[red]))
      expect(described_class.drop_option(page_logic, 'b')['jumps'].pluck('goto')).to eq(%w[p3 p4])
    end

    it 'drops the whole rule, not just the part, when a part of a group becomes empty' do
      expect(described_class.drop_option(question_logic, 'b')).to eq('required_if' => leaf('score', 'absent'))
    end

    it 'drops a rule whose list becomes empty' do
      result = described_class.drop_option(page_logic, 'red')

      expect(result['jumps'].pluck('goto')).to eq(%w[p3 end])
      expect(result['jumps'].first['when']).to eq(leaf('colour', 'one_of', %w[blue]))
    end

    it 'drops a contains_all rule entirely, because it can no longer hold' do
      expect(described_class.drop_option(page_logic, 'a')['jumps'].pluck('goto')).to eq(%w[p3 p4])
    end

    it 'drops a group rule entirely when any part becomes empty' do
      result = described_class.drop_option(question_logic, 'red')

      expect(result).to eq('required_if' => leaf('score', 'absent'))
    end

    it 'leaves logic without the option alone' do
      expect(described_class.drop_option(page_logic, 'zzz')).to eq(page_logic)
    end

    it 'removes jumps entirely when the last one goes' do
      logic = { 'jumps' => [{ 'when' => leaf('colour', 'one_of', %w[red]), 'goto' => 'p3' }] }

      expect(described_class.drop_option(logic, 'red')).to eq({})
    end
  end

  describe '.drop_field' do
    it 'drops every rule that uses the field' do
      expect(described_class.drop_field(page_logic, 'score')['jumps'].pluck('goto')).to eq(%w[p3 p4])
      expect(described_class.drop_field(question_logic, 'colour')).to eq('required_if' => leaf('score', 'absent'))
    end

    it 'drops jumps to a deleted page and clears a page default to it' do
      expect(described_class.drop_field(page_logic, 'p3')['jumps'].pluck('goto')).to eq(%w[end p4])
      expect(described_class.drop_field(page_logic, 'p2')).not_to have_key('next')
    end

    it 'can leave no logic at all' do
      expect(described_class.drop_field({ 'next' => 'p2' }, 'p2')).to eq({})
    end
  end
end
