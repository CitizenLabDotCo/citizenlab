# frozen_string_literal: true

require 'rails_helper'

RSpec.describe FormLogic::Validator do
  def page(id, **attributes)
    FormLogic::Field.from_h({ 'id' => id, 'key' => id, 'input_type' => 'page' }.merge(attributes.stringify_keys))
  end

  def question(id, input_type, options: [], **attributes)
    FormLogic::Field.from_h({
      'id' => id, 'key' => id, 'input_type' => input_type,
      'options' => options.map { |option| { 'id' => "#{option}-id", 'key' => option } }
    }.merge(attributes.stringify_keys))
  end

  let(:fields) do
    [
      page('p1'),
      question('colour', 'select', options: %w[red blue]),
      question('tags', 'multiselect', options: %w[a b]),
      question('score', 'linear_scale', maximum: 5),
      question('text', 'text'),
      question('old', 'select', options: %w[x], enabled: false),
      page('p2'),
      question('later', 'select', options: %w[y]),
      page('p3'),
      page('the-end', key: 'form_end')
    ]
  end

  def leaf(field, op, value = :none)
    value == :none ? { 'field' => field, 'op' => op } : { 'field' => field, 'op' => op, 'value' => value }
  end

  def errors_for(logic) = described_class.new(fields, logic).call

  def page_jump(condition, goto = 'p3', on: 'p1') = { on => { 'jumps' => [{ 'when' => condition, 'goto' => goto }] } }

  it 'accepts no logic' do
    expect(errors_for({})).to eq({})
  end

  it 'accepts valid logic of every kind' do
    logic = {
      'p1' => {
        'jumps' => [
          { 'when' => leaf('colour', 'one_of', %w[red-id]), 'goto' => 'p3' },
          { 'when' => { 'all' => [leaf('tags', 'contains_any', %w[a-id]), { 'not' => leaf('score', 'gte', 4) }] }, 'goto' => 'end' },
          { 'when' => { 'any' => [leaf('score', 'one_of', [1, 2]), leaf('colour', 'absent')] }, 'goto' => 'the-end' }
        ],
        'next' => 'p3'
      },
      'p2' => { 'next' => 'end' },
      'later' => { 'display' => leaf('colour', 'none_of', %w[blue-id]), 'required_if' => leaf('score', 'absent') }
    }

    expect(errors_for(logic)).to eq({})
  end

  it 'accepts a jump on a question from an earlier page' do
    expect(errors_for(page_jump(leaf('colour', 'present'), 'the-end', on: 'p2'))).to eq({})
  end

  describe 'shape' do
    it 'rejects keys that do not belong to a page' do
      expect(errors_for('p1' => { 'display' => leaf('colour', 'present'), 'foo' => 1 })).to eq(
        'p1' => [{ error: :unknown_key, path: 'display' }, { error: :unknown_key, path: 'foo' }]
      )
    end

    it 'rejects keys that do not belong to a question' do
      expect(errors_for('later' => { 'jumps' => [], 'next' => 'p3' })).to eq(
        'later' => [{ error: :unknown_key, path: 'jumps' }, { error: :unknown_key, path: 'next' }]
      )
    end

    it 'rejects logic that is not an object, and jumps that are not a list' do
      expect(errors_for('p1' => [], 'p2' => { 'jumps' => {} })).to eq(
        'p1' => [{ error: :invalid_logic, path: '' }], 'p2' => [{ error: :invalid_logic, path: 'jumps' }]
      )
    end

    it 'rejects a jump without a condition or a target' do
      expect(errors_for('p1' => { 'jumps' => [{ 'goto' => 'p3' }, { 'when' => leaf('colour', 'present') }, 'p3'] })).to eq(
        'p1' => [
          { error: :invalid_condition, path: 'jumps.0.when' },
          { error: :unknown_target, path: 'jumps.1.goto', value: nil },
          { error: :invalid_logic, path: 'jumps.2' }
        ]
      )
    end

    it 'rejects malformed conditions' do
      logic = { 'p1' => { 'jumps' => [
        { 'when' => { 'all' => [] }, 'goto' => 'p3' },
        { 'when' => { 'any' => leaf('colour', 'present') }, 'goto' => 'p3' },
        { 'when' => { 'all' => [leaf('colour', 'present')], 'any' => [leaf('colour', 'present')] }, 'goto' => 'p3' },
        { 'when' => { 'field' => 'colour' }, 'goto' => 'p3' },
        { 'when' => { 'not' => nil }, 'goto' => 'p3' },
        { 'when' => leaf('colour', 'present').merge('extra' => 1), 'goto' => 'p3' }
      ] } }

      expect(errors_for(logic)['p1']).to eq([
        { error: :empty_group, path: 'jumps.0.when.all' },
        { error: :invalid_condition, path: 'jumps.1.when.any' },
        { error: :invalid_condition, path: 'jumps.2.when' },
        { error: :unknown_operator, path: 'jumps.3.when', value: nil },
        { error: :invalid_condition, path: 'jumps.4.when.not' },
        { error: :invalid_condition, path: 'jumps.5.when' }
      ])
    end

    it 'points into nested groups' do
      condition = { 'all' => [leaf('colour', 'present'), { 'any' => [leaf('colour', 'present'), leaf('nope', 'present')] }] }

      expect(errors_for(page_jump(condition))).to eq(
        'p1' => [{ error: :unknown_field, path: 'jumps.0.when.all.1.any.1', value: 'nope' }]
      )
    end
  end

  describe 'targets' do
    it 'rejects unknown pages and pages that are not further down the form' do
      logic = {
        'p1' => { 'next' => 'nope' },
        'p2' => { 'jumps' => [
          { 'when' => leaf('later', 'present'), 'goto' => 'p1' },
          { 'when' => leaf('later', 'present'), 'goto' => 'p2' },
          { 'when' => leaf('later', 'present'), 'goto' => 'colour' }
        ] }
      }

      expect(errors_for(logic)).to eq(
        'p1' => [{ error: :unknown_target, path: 'next', value: 'nope' }],
        'p2' => [
          { error: :target_not_forward, path: 'jumps.0.goto', value: 'p1' },
          { error: :target_not_forward, path: 'jumps.1.goto', value: 'p2' },
          { error: :unknown_target, path: 'jumps.2.goto', value: 'colour' }
        ]
      )
    end

    it 'rejects a disabled page as a target' do
      fields << page('hidden', enabled: false)

      expect(errors_for('p3' => { 'next' => 'hidden' })).to eq('p3' => [{ error: :unknown_target, path: 'next', value: 'hidden' }])
    end

    it 'rejects logic on the end page' do
      expect(errors_for('the-end' => { 'next' => 'end' })).to eq('the-end' => [{ error: :logic_on_end_page, path: '' }])
    end

    it 'accepts a null next' do
      expect(errors_for('p1' => { 'next' => nil, 'jumps' => [] })).to eq({})
    end
  end

  describe 'sources' do
    it 'rejects unknown fields, pages, disabled fields and fields further down the form' do
      logic = { 'p1' => { 'jumps' => [
        { 'when' => leaf('nope', 'present'), 'goto' => 'p3' },
        { 'when' => leaf('p2', 'present'), 'goto' => 'p3' },
        { 'when' => leaf('old', 'present'), 'goto' => 'p3' },
        { 'when' => leaf('later', 'present'), 'goto' => 'p3' }
      ] } }

      expect(errors_for(logic)['p1']).to eq([
        { error: :unknown_field, path: 'jumps.0.when', value: 'nope' },
        { error: :source_is_page, path: 'jumps.1.when', value: 'p2' },
        { error: :source_disabled, path: 'jumps.2.when', value: 'old' },
        { error: :source_after_target, path: 'jumps.3.when', value: 'later' }
      ])
    end

    it 'rejects a display condition on the question itself or on a later question on the same page' do
      fields.insert(2, question('why', 'text'))

      expect(errors_for('why' => { 'display' => leaf('why', 'present'), 'required_if' => leaf('tags', 'present') })).to eq(
        'why' => [
          { error: :source_after_target, path: 'display', value: 'why' },
          { error: :source_after_target, path: 'required_if', value: 'tags' }
        ]
      )
    end

    it 'accepts a display condition on an earlier question on the same page' do
      expect(errors_for('score' => { 'display' => leaf('colour', 'present') })).to eq({})
    end

    it 'rejects logic on disabled and unknown fields' do
      expect(errors_for('old' => { 'display' => leaf('colour', 'present') }, 'gone' => { 'next' => 'p3' })).to eq(
        'old' => [{ error: :field_disabled, path: '' }], 'gone' => [{ error: :unknown_field, path: '', value: 'gone' }]
      )
    end
  end

  describe 'operators and values' do
    it 'rejects operators the source type does not support' do
      logic = { 'p1' => { 'jumps' => [
        { 'when' => leaf('colour', 'contains_any', %w[red-id]), 'goto' => 'p3' },
        { 'when' => leaf('tags', 'one_of', %w[a-id]), 'goto' => 'p3' },
        { 'when' => leaf('text', 'present'), 'goto' => 'p3' },
        { 'when' => leaf('score', 'between', [1, 2]), 'goto' => 'p3' }
      ] } }

      expect(errors_for(logic)['p1']).to eq([
        { error: :operator_not_supported, path: 'jumps.0.when', value: 'contains_any' },
        { error: :operator_not_supported, path: 'jumps.1.when', value: 'one_of' },
        { error: :operator_not_supported, path: 'jumps.2.when', value: 'present' },
        { error: :unknown_operator, path: 'jumps.3.when', value: 'between' }
      ])
    end

    it 'rejects a value on present and absent' do
      expect(errors_for(page_jump(leaf('colour', 'present', 'red-id')))).to eq(
        'p1' => [{ error: :invalid_value, path: 'jumps.0.when', value: 'red-id' }]
      )
    end

    it 'rejects option lists that are empty, not lists, or contain unknown options' do
      logic = { 'p1' => { 'jumps' => [
        { 'when' => leaf('colour', 'one_of', []), 'goto' => 'p3' },
        { 'when' => leaf('colour', 'one_of', 'red-id'), 'goto' => 'p3' },
        { 'when' => leaf('colour', 'none_of', %w[red-id a-id]), 'goto' => 'p3' },
        { 'when' => leaf('colour', 'one_of', %w[red]), 'goto' => 'p3' },
        { 'when' => leaf('tags', 'contains_all', [1]), 'goto' => 'p3' }
      ] } }

      expect(errors_for(logic)['p1']).to eq([
        { error: :invalid_value, path: 'jumps.0.when', value: [] },
        { error: :invalid_value, path: 'jumps.1.when', value: 'red-id' },
        { error: :unknown_option, path: 'jumps.2.when', value: 'a-id' },
        { error: :unknown_option, path: 'jumps.3.when', value: 'red' },
        { error: :unknown_option, path: 'jumps.4.when', value: 1 }
      ])
    end

    it 'rejects scale values that are not whole numbers between 1 and the maximum' do
      logic = { 'p1' => { 'jumps' => [
        { 'when' => leaf('score', 'eq', 0), 'goto' => 'p3' },
        { 'when' => leaf('score', 'gt', 6), 'goto' => 'p3' },
        { 'when' => leaf('score', 'lt', 2.5), 'goto' => 'p3' },
        { 'when' => leaf('score', 'gte', '3'), 'goto' => 'p3' },
        { 'when' => leaf('score', 'one_of', [1, 9]), 'goto' => 'p3' },
        { 'when' => leaf('score', 'eq'), 'goto' => 'p3' },
        { 'when' => leaf('score', 'lte', 5), 'goto' => 'p3' }
      ] } }

      expect(errors_for(logic)['p1']).to eq([
        { error: :invalid_value, path: 'jumps.0.when', value: 0 },
        { error: :invalid_value, path: 'jumps.1.when', value: 6 },
        { error: :invalid_value, path: 'jumps.2.when', value: 2.5 },
        { error: :invalid_value, path: 'jumps.3.when', value: '3' },
        { error: :invalid_value, path: 'jumps.4.when', value: 9 },
        { error: :invalid_value, path: 'jumps.5.when', value: nil }
      ])
    end

    it 'accepts any whole number for a scale without a maximum' do
      fields[3] = question('score', 'linear_scale')

      expect(errors_for(page_jump(leaf('score', 'gt', 50)))).to eq({})
    end
  end
end
