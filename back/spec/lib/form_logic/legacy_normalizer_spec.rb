# frozen_string_literal: true

require 'rails_helper'

RSpec.describe FormLogic::LegacyNormalizer do
  def page(id, logic = {}, **attributes)
    FormLogic::Field.from_h({ 'id' => id, 'key' => id, 'input_type' => 'page', 'logic' => logic }.merge(attributes.stringify_keys))
  end

  def question(id, input_type, rules = nil, options: [], **attributes)
    FormLogic::Field.from_h({
      'id' => id, 'key' => id, 'input_type' => input_type,
      'logic' => rules.nil? ? {} : { 'rules' => rules },
      'options' => options.map { |option| { 'id' => "#{option}-id", 'key' => option } }
    }.merge(attributes.stringify_keys))
  end

  def rule(if_value, goto) = { 'if' => if_value, 'goto_page_id' => goto }

  def normalize(*fields) = described_class.new(fields).call

  let(:pages) { [page('p2'), page('p3'), page('p4')] }

  it 'gives no logic for a form without logic' do
    result = normalize(page('p1'), question('q', 'select', options: %w[a]), *pages)

    expect(result.logic).to eq({})
    expect(result.report).to eq([])
  end

  it 'keeps a page default as next' do
    expect(normalize(page('p1', { 'next_page_id' => 'p3' }), *pages).logic).to eq('p1' => { 'next' => 'p3' })
  end

  it 'treats empty logic and an empty rules list as no logic' do
    expect(normalize(page('p1', { 'rules' => [] }), question('q', 'select', [], options: %w[a]), *pages).logic).to eq({})
  end

  it 'turns select rules into jumps on the page, by option id' do
    result = normalize(page('p1'), question('q', 'select', [rule('a-id', 'p3')], options: %w[a b]), *pages)

    expect(result.logic).to eq('p1' => {
      'jumps' => [{ 'when' => { 'field' => 'q', 'op' => 'one_of', 'value' => ['a-id'] }, 'goto' => 'p3' }]
    })
  end

  it 'turns any_other_answer into the options without their own rule' do
    result = normalize(
      page('p1'), question('q', 'select', [rule('any_other_answer', 'p4'), rule('a-id', 'p2')], options: %w[a b c]), *pages
    )

    expect(result.logic['p1']['jumps']).to eq([
      { 'when' => { 'field' => 'q', 'op' => 'one_of', 'value' => %w[b-id c-id] }, 'goto' => 'p4' },
      { 'when' => { 'field' => 'q', 'op' => 'one_of', 'value' => ['a-id'] }, 'goto' => 'p2' }
    ])
  end

  it 'turns no_answer into absent' do
    result = normalize(page('p1'), question('q', 'select', [rule('no_answer', 'p3')], options: %w[a]), *pages)

    expect(result.logic['p1']['jumps']).to eq([{ 'when' => { 'field' => 'q', 'op' => 'absent' }, 'goto' => 'p3' }])
  end

  it 'orders the jumps of one question from the farthest target to the nearest' do
    result = normalize(
      page('p1'),
      question('q', 'multiselect', [rule('a-id', 'p2'), rule('b-id', 'p4'), rule('c-id', 'p3'), rule('d-id', 'end_page')], options: %w[a b c d]),
      *pages, page('end_page', key: 'form_end')
    )

    expect(result.logic['p1']['jumps'].pluck('goto')).to eq(%w[end_page p4 p3 p2])
    expect(result.logic['p1']['jumps'].first['when']).to eq('field' => 'q', 'op' => 'contains_any', 'value' => ['d-id'])
  end

  it 'keeps the stored order for targets at the same distance' do
    result = normalize(page('p1'), question('q', 'select', [rule('b-id', 'p3'), rule('a-id', 'p3')], options: %w[a b]), *pages)

    expect(result.logic['p1']['jumps'].map { |jump| jump['when']['value'] }).to eq([['b-id'], ['a-id']])
  end

  it 'puts the jumps of later questions on the page first' do
    result = normalize(
      page('p1'),
      question('first', 'select', [rule('a-id', 'p4')], options: %w[a]),
      question('second', 'select', [rule('b-id', 'p2')], options: %w[b]),
      *pages
    )

    expect(result.logic['p1']['jumps'].map { |jump| jump['when']['field'] }).to eq(%w[second first])
  end

  it 'turns scale rules into eq, reading numeric strings as numbers' do
    result = normalize(page('p1'), question('s', 'linear_scale', [rule(4, 'p3'), rule('2', 'p2')], maximum: 5), *pages)

    expect(result.logic['p1']['jumps']).to eq([
      { 'when' => { 'field' => 's', 'op' => 'eq', 'value' => 4 }, 'goto' => 'p3' },
      { 'when' => { 'field' => 's', 'op' => 'eq', 'value' => 2 }, 'goto' => 'p2' }
    ])
  end

  it 'turns scale any_other_answer into the values up to the maximum without their own rule' do
    result = normalize(page('p1'), question('s', 'rating', [rule(2, 'p2'), rule('any_other_answer', 'p3')], maximum: 4), *pages)

    expect(result.logic['p1']['jumps'].first).to eq(
      'when' => { 'field' => 's', 'op' => 'one_of', 'value' => [1, 3, 4] }, 'goto' => 'p3'
    )
  end

  it 'ignores the page default when a question on the page has rules, and reports it' do
    result = normalize(page('p1', { 'next_page_id' => 'p4' }), question('q', 'select', [rule('a-id', 'p3')], options: %w[a]), *pages)

    expect(result.logic['p1'].keys).to eq(['jumps'])
    expect(result.report).to include(field_id: 'p1', reason: :page_default_ignored, rule: { 'next_page_id' => 'p4' })
  end

  it 'also ignores the page default for leftover rules on a question type without logic' do
    result = normalize(page('p1', { 'next_page_id' => 'p4' }), question('n', 'number', [rule(3, 'p3')]), *pages)

    expect(result.logic).to eq({})
    expect(result.report.pluck(:reason)).to contain_exactly(:page_default_ignored, :unsupported_input_type)
  end

  it 'keeps the page default when the only rules are on a disabled question' do
    result = normalize(
      page('p1', { 'next_page_id' => 'p4' }), question('q', 'select', [rule('a-id', 'p3')], options: %w[a], enabled: false), *pages
    )

    expect(result.logic).to eq('p1' => { 'next' => 'p4' })
    expect(result.report).to eq([])
  end

  it 'turns the old form_end target into end' do
    result = normalize(page('p1'), question('q', 'select', [rule('a-id', 'form_end')], options: %w[a]), *pages)
    old_default = normalize(page('p1', { 'next_page_id' => 'form_end' }), *pages)

    expect(result.logic['p1']['jumps'].first['goto']).to eq('end')
    expect(old_default.logic).to eq('p1' => { 'next' => 'end' })
  end

  it 'sorts end as the farthest target' do
    result = normalize(page('p1'), question('q', 'multiselect', [rule('a-id', 'p4'), rule('b-id', 'form_end')], options: %w[a b]), *pages)

    expect(result.logic['p1']['jumps'].pluck('goto')).to eq(%w[end p4])
  end

  it 'keeps unknown, earlier and non-page targets as they are and reports them, sorted as the nearest' do
    result = normalize(
      page('p1'),
      question('q', 'multiselect', [rule('a-id', 'nope'), rule('b-id', 'p3'), rule('c-id', 'q')], options: %w[a b c]),
      *pages
    )

    expect(result.logic['p1']['jumps'].pluck('goto')).to eq(%w[p3 nope q])
    expect(result.report.pluck(:reason)).to eq(%i[unknown_target unknown_target])
  end

  it 'reports a target that is not further down the form' do
    result = normalize(page('p0'), page('p1'), question('q', 'select', [rule('a-id', 'p0')], options: %w[a]), *pages)

    expect(result.logic['p1']['jumps'].first['goto']).to eq('p0')
    expect(result.report).to eq([{ field_id: 'q', reason: :target_not_forward, rule: rule('a-id', 'p0') }])
  end

  it 'drops and reports rules that can never fire' do
    result = normalize(
      page('p1'),
      question('q', 'select', [rule('gone-id', 'p2'), rule('a', 'p3'), rule(nil, 'p3')], options: %w[a]),
      question('s', 'linear_scale', [rule(nil, 'p2'), rule('x', 'p3'), rule(2.5, 'p3')], maximum: 3),
      question('r', 'ranking', [rule('a-id', 'p2'), rule('any_other_answer', 'p3'), rule('no_answer', 'p4')], options: %w[a]),
      question('i', 'select_image', [rule('a-id', 'p2')], options: %w[a]),
      question('all_ruled', 'select', [rule('a-id', 'p2'), rule('any_other_answer', 'p3')], options: %w[a]),
      *pages
    )

    expect(result.report.map { |entry| [entry[:field_id], entry[:reason]] }).to eq([
      ['q', :unknown_option],
      ['q', :unknown_option],
      ['q', :rule_without_value],
      ['s', :rule_without_value],
      ['s', :invalid_value],
      ['s', :invalid_value],
      ['r', :never_fires],
      ['r', :never_fires],
      ['i', :unsupported_input_type],
      ['all_ruled', :never_fires]
    ])
    expect(result.logic['p1']['jumps'].map { |jump| [jump['when']['field'], jump['when']['op']] }).to eq(
      [%w[all_ruled one_of], %w[r absent]]
    )
  end

  it 'ignores questions before the first page' do
    expect(normalize(question('q', 'select', [rule('a-id', 'p3')], options: %w[a]), page('p1'), *pages).logic).to eq({})
  end

  it 'keeps a backward page default and reports it' do
    result = normalize(page('p1'), page('p2', { 'next_page_id' => 'p1' }))

    expect(result.logic).to eq('p2' => { 'next' => 'p1' })
    expect(result.report).to eq([{ field_id: 'p2', reason: :target_not_forward, rule: { 'next_page_id' => 'p1' } }])
  end

  it 'reports an unknown page default' do
    result = normalize(page('p1', { 'next_page_id' => 'nope' }), *pages)

    expect(result.logic).to eq('p1' => { 'next' => 'nope' })
    expect(result.report).to eq([{ field_id: 'p1', reason: :unknown_target, rule: { 'next_page_id' => 'nope' } }])
  end
end
