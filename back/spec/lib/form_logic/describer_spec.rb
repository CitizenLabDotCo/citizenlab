# frozen_string_literal: true

require 'rails_helper'

RSpec.describe FormLogic::Describer do
  def page(id, **attributes)
    FormLogic::Field.from_h({ 'id' => id, 'key' => id, 'input_type' => 'page' }.merge(attributes.stringify_keys))
  end

  def question(id) = FormLogic::Field.from_h('id' => id, 'key' => id, 'input_type' => 'select')

  def jump(field, goto) = { 'when' => { 'field' => field, 'op' => 'present' }, 'goto' => goto }

  let(:fields) { [page('p1'), question('a'), question('b'), page('p2'), page('p3'), question('c'), page('p4'), page('end-page', key: 'form_end')] }

  describe '#static_targets' do
    it 'lists the jump targets in order, then the default' do
      describer = described_class.new(fields, 'p1' => { 'jumps' => [jump('a', 'p3'), jump('b', 'p4'), jump('a', 'p3')], 'next' => 'end' })

      expect(describer.static_targets('p1')).to eq(%w[p3 p4 end])
    end

    it 'defaults to the following page' do
      expect(described_class.new(fields, {}).static_targets('p2')).to eq(%w[p3])
    end

    it 'gives nothing after the last page' do
      expect(described_class.new(fields, {}).static_targets('end-page')).to eq([])
    end
  end

  describe '#unreachable_page_ids' do
    it 'is empty without logic' do
      expect(described_class.new(fields, {}).unreachable_page_ids).to eq([])
    end

    it 'lists pages that no path can reach' do
      describer = described_class.new(fields, 'p1' => { 'next' => 'p4' })

      expect(describer.unreachable_page_ids).to eq(%w[p2 p3])
    end

    it 'counts a page as reachable when any jump can reach it' do
      describer = described_class.new(fields, 'p1' => { 'jumps' => [jump('a', 'p3')], 'next' => 'p4' })

      expect(describer.unreachable_page_ids).to eq(%w[p2])
    end

    it 'treats end as reaching the end page only' do
      describer = described_class.new(fields, 'p1' => { 'next' => 'end' })

      expect(describer.unreachable_page_ids).to eq(%w[p2 p3 p4])
    end

    it 'ignores backward and unknown targets' do
      describer = described_class.new(fields, 'p1' => { 'jumps' => [jump('a', 'nope')], 'next' => 'p4' }, 'p4' => { 'next' => 'p2' })

      expect(describer.unreachable_page_ids).to eq(%w[p2 p3 end-page])
    end
  end

  describe '#jumps_using' do
    it 'lists the jumps whose condition uses the question, with their page and position' do
      logic = { 'p1' => { 'jumps' => [jump('a', 'p3'), { 'when' => { 'all' => [{ 'field' => 'b', 'op' => 'present' }, { 'field' => 'a', 'op' => 'absent' }] }, 'goto' => 'p4' }, jump('b', 'end')] } }

      expect(described_class.new(fields, logic).jumps_using('a').map { |entry| entry.slice(:page_id, :index) }).to eq(
        [{ page_id: 'p1', index: 0 }, { page_id: 'p1', index: 1 }]
      )
      expect(described_class.new(fields, logic).jumps_using('c')).to eq([])
    end
  end
end
