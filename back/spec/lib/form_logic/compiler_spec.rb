# frozen_string_literal: true

require 'rails_helper'

RSpec.describe FormLogic::Compiler do
  def page(id, **attributes)
    FormLogic::Field.from_h({ 'id' => id, 'key' => id, 'input_type' => 'page' }.merge(attributes.stringify_keys))
  end

  def question(id, input_type = 'select', options: [], **attributes)
    FormLogic::Field.from_h({
      'id' => id, 'key' => id, 'input_type' => input_type,
      'options' => options.map { |option| { 'id' => "#{option}-id", 'key' => option } }
    }.merge(attributes.stringify_keys))
  end

  def compile(fields, logic = {}) = described_class.new(fields, logic).call

  let(:colour) { question('colour', options: %w[red blue], required: true) }

  it 'compiles an empty form' do
    expect(compile([])).to eq('pages' => [], 'fields' => {})
  end

  it 'puts every question on its page, in order, with its required flag' do
    program = compile([page('p1'), colour, question('size', 'number'), page('p2'), question('age', 'number')])

    expect(program).to eq(
      'pages' => [{ 'id' => 'p1', 'fields' => %w[colour size] }, { 'id' => 'p2', 'fields' => %w[age] }],
      'fields' => { 'colour' => { 'required' => true }, 'size' => { 'required' => false }, 'age' => { 'required' => false } }
    )
  end

  it 'leaves out disabled questions' do
    program = compile([page('p1'), colour, question('size', 'number', enabled: false)])

    expect(program['pages']).to eq([{ 'id' => 'p1', 'fields' => %w[colour] }])
    expect(program['fields'].keys).to eq(%w[colour])
  end

  it 'leaves out disabled pages, so their questions join the page before, like the form does' do
    program = compile([page('p1'), colour, page('p2', enabled: false), question('size', 'number')])

    expect(program['pages']).to eq([{ 'id' => 'p1', 'fields' => %w[colour size] }])
  end

  it 'leaves out questions before the first page' do
    expect(compile([colour, page('p1')])).to eq('pages' => [{ 'id' => 'p1', 'fields' => [] }], 'fields' => {})
  end

  it 'turns option ids into answer keys' do
    logic = { 'p1' => { 'jumps' => [{ 'when' => { 'field' => 'colour', 'op' => 'one_of', 'value' => %w[blue-id red-id] }, 'goto' => 'p2' }] } }

    expect(compile([page('p1'), colour, page('p2')], logic)['pages'].first['jumps']).to eq(
      [{ 'when' => { 'field' => 'colour', 'op' => 'one_of', 'value' => %w[blue red] }, 'goto' => 'p2' }]
    )
  end

  it 'keeps numbers as they are' do
    scale = question('score', 'linear_scale', maximum: 5)
    logic = { 'p1' => { 'jumps' => [{ 'when' => { 'field' => 'score', 'op' => 'one_of', 'value' => [1, 2] }, 'goto' => 'p2' }] } }

    expect(compile([page('p1'), scale, page('p2')], logic)['pages'].first['jumps'].first['when']['value']).to eq([1, 2])
  end

  it 'drops unknown option ids, and the whole jump when none are left' do
    logic = { 'p1' => { 'jumps' => [
      { 'when' => { 'field' => 'colour', 'op' => 'one_of', 'value' => %w[gone-id red-id] }, 'goto' => 'p2' },
      { 'when' => { 'field' => 'colour', 'op' => 'none_of', 'value' => %w[gone-id] }, 'goto' => 'p3' }
    ] } }

    expect(compile([page('p1'), colour, page('p2'), page('p3')], logic)['pages'].first['jumps']).to eq(
      [{ 'when' => { 'field' => 'colour', 'op' => 'one_of', 'value' => %w[red] }, 'goto' => 'p2' }]
    )
  end

  it 'drops a jump whose condition uses a disabled, unknown or page field, also inside groups' do
    disabled = question('old', 'number', enabled: false)
    logic = { 'p1' => { 'jumps' => [
      { 'when' => { 'field' => 'old', 'op' => 'absent' }, 'goto' => 'p2' },
      { 'when' => { 'field' => 'nope', 'op' => 'absent' }, 'goto' => 'p2' },
      { 'when' => { 'field' => 'p1', 'op' => 'absent' }, 'goto' => 'p2' },
      { 'when' => { 'any' => [{ 'field' => 'colour', 'op' => 'present' }, { 'field' => 'old', 'op' => 'present' }] }, 'goto' => 'p2' },
      { 'when' => { 'not' => { 'field' => 'colour', 'op' => 'present' } }, 'goto' => 'p2' }
    ] } }

    expect(compile([page('p1'), colour, disabled, page('p2')], logic)['pages'].first['jumps']).to eq(
      [{ 'when' => { 'not' => { 'field' => 'colour', 'op' => 'present' } }, 'goto' => 'p2' }]
    )
  end

  it 'compiles page defaults' do
    program = compile([page('p1'), page('p2'), page('p3')], { 'p1' => { 'next' => 'p3' } })

    expect(program['pages'].first).to eq('id' => 'p1', 'fields' => [], 'next' => 'p3')
  end

  it 'resolves end to the end page' do
    logic = { 'p1' => { 'jumps' => [{ 'when' => { 'field' => 'colour', 'op' => 'present' }, 'goto' => 'end' }], 'next' => 'end' } }
    program = compile([page('p1'), colour, page('p2'), page('the-end', key: 'form_end')], logic)

    expect(program['pages'].first.slice('jumps', 'next')).to eq(
      'jumps' => [{ 'when' => { 'field' => 'colour', 'op' => 'present' }, 'goto' => 'the-end' }], 'next' => 'the-end'
    )
  end

  it 'keeps end when the form has no end page' do
    program = compile([page('p1'), page('p2')], { 'p1' => { 'next' => 'end' } })

    expect(program['pages'].first['next']).to eq('end')
  end

  it 'sends end and the end page to the user fields page when it is in the form' do
    fields = [page('p1'), colour, page('p2'), page('user', key: 'user_page'), question('u_gender', 'select'), page('the-end', key: 'form_end')]
    logic = {
      'p1' => { 'jumps' => [{ 'when' => { 'field' => 'colour', 'op' => 'present' }, 'goto' => 'end' }], 'next' => 'the-end' }
    }

    program = compile(fields, logic)

    expect(program['pages'].first.slice('jumps', 'next')).to eq(
      'jumps' => [{ 'when' => { 'field' => 'colour', 'op' => 'present' }, 'goto' => 'user' }], 'next' => 'user'
    )
    expect(program['pages'].pluck('id')).to eq(%w[p1 p2 user the-end])
  end

  it 'keeps unknown and backward targets, which end the walk' do
    logic = { 'p2' => { 'jumps' => [{ 'when' => { 'field' => 'colour', 'op' => 'present' }, 'goto' => 'nope' }], 'next' => 'p1' } }

    expect(compile([page('p1'), page('p2'), colour, page('p3')], logic)['pages'][1].slice('jumps', 'next')).to eq(
      'jumps' => [{ 'when' => { 'field' => 'colour', 'op' => 'present' }, 'goto' => 'nope' }], 'next' => 'p1'
    )
  end

  it 'compiles display and required_if, turning option ids into keys' do
    fields = [page('p1'), colour, question('why', 'text')]
    logic = { 'why' => {
      'display' => { 'field' => 'colour', 'op' => 'one_of', 'value' => %w[red-id] },
      'required_if' => { 'field' => 'colour', 'op' => 'none_of', 'value' => %w[blue-id] }
    } }

    expect(compile(fields, logic)['fields']['why']).to eq(
      'required' => false,
      'display' => { 'field' => 'colour', 'op' => 'one_of', 'value' => %w[red] },
      'required_if' => { 'field' => 'colour', 'op' => 'none_of', 'value' => %w[blue] }
    )
  end

  it 'drops a display condition that uses a field that is not in the form, so the question is always shown' do
    logic = { 'why' => { 'display' => { 'field' => 'nope', 'op' => 'present' } } }

    expect(compile([page('p1'), question('why', 'text')], logic)['fields']['why']).to eq('required' => false)
  end

  it 'ignores logic of fields that are not in the form' do
    logic = { 'gone' => { 'next' => 'p1' }, 'colour' => { 'jumps' => [] } }

    expect(compile([page('p1'), colour], logic)).to eq(
      'pages' => [{ 'id' => 'p1', 'fields' => %w[colour] }], 'fields' => { 'colour' => { 'required' => true } }
    )
  end

  it 'compiles a program the walker runs' do
    fields = [page('p1'), colour, page('p2'), question('why', 'text'), page('p3'), page('the-end', key: 'form_end')]
    logic = {
      'p1' => { 'jumps' => [{ 'when' => { 'field' => 'colour', 'op' => 'one_of', 'value' => %w[red-id] }, 'goto' => 'end' }] }
    }

    walker = FormLogic::SurveyWalker.new(compile(fields, logic))

    expect(walker.walk('colour' => 'red').path).to eq(%w[p1 the-end])
    expect(walker.walk('colour' => 'blue').path).to eq(%w[p1 p2 p3 the-end])
  end
end
