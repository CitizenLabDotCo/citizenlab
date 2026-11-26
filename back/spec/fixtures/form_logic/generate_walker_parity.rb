# frozen_string_literal: true

# Writes walker/generated.json: random programs and answers, with the Ruby walker's results as
# the expected ones, so the TS walker is checked against Ruby on cases nobody wrote by hand.
#   bin/rails runner ./spec/fixtures/form_logic/generate_walker_parity.rb spec/fixtures/form_logic/walker/generated.json
class GenerateWalkerParity
  OPS = FormLogic::Conditions::OPERATORS
  REQUIRED_VALUES = [true, false, nil, 'true'].freeze
  SCALARS = ['a', 'b', 'c', '', ' ', 1, 2, 3, 3.0, 0, -1, true, false, '1', nil].freeze

  def call
    srand(20_261_126)
    cases = []
    while cases.size < 400
      prog = program
      question_ids = prog['fields'].keys
      answers = (question_ids + ['ghost']).sample(rand(0..question_ids.size + 1)).index_with { |_q| answer }
      begin
        walk = FormLogic::SurveyWalker.new(prog).walk(answers)
        cases << { 'description' => "generated case #{cases.size + 1}", 'program' => prog, 'answers' => answers, 'expected' => walk.to_h }
      rescue FormLogic::InvalidProgram
        next
      end
    end

    {
      'description' => 'Random programs and answers to catch Ruby/TS differences nobody thought of. Generated; ' \
                       'the expected results are what the Ruby walker returned. Regenerate rather than edit.',
      'cases' => cases
    }
  end

  private

  def value_for(op)
    case op
    when 'present', 'absent' then rand < 0.8 ? :none : 'x'
    when 'one_of', 'none_of', 'contains_any', 'contains_all'
      rand < 0.85 ? SCALARS.sample(rand(0..3)) : SCALARS.sample
    else rand < 0.8 ? [1, 2, 3, 4, 2.5, 0].sample : SCALARS.sample
    end
  end

  def answer
    case rand(4)
    when 0 then SCALARS.sample
    when 1 then SCALARS.compact.sample(rand(0..3))
    when 2 then [1, 2, 3, 4, 5].sample
    else [{}, [], { 'en' => 'x' }, [['a']], ['a', 1]].sample
    end
  end

  def condition(fields, depth = 0)
    if depth < 2 && rand < 0.3
      kind = %w[all any not].sample
      return { 'not' => condition(fields, depth + 1) } if kind == 'not'

      return { kind => Array.new(rand(0..3)) { condition(fields, depth + 1) } }
    end
    op = OPS.sample
    leaf = { 'field' => (fields + ['ghost']).sample, 'op' => op }
    value = value_for(op)
    leaf['value'] = value unless value == :none
    leaf
  end

  def program
    page_ids = Array.new(rand(1..5)) { |i| "p#{i + 1}" }
    question_ids = []
    pages = page_ids.map do |id|
      fields = Array.new(rand(0..3)) { "q#{question_ids.size + 1}".tap { |q| question_ids << q } }
      { 'id' => id, 'fields' => fields }
    end
    targets = page_ids + %w[end nope]
    pages.each do |page|
      page['jumps'] = Array.new(rand(0..3)) { { 'when' => condition(question_ids), 'goto' => targets.sample } } if rand < 0.7
      page['next'] = (targets + [nil]).sample if rand < 0.4
    end
    fields = question_ids.to_h do |q|
      settings = { 'required' => REQUIRED_VALUES.sample }
      settings['display'] = condition(question_ids) if rand < 0.3
      settings['required_if'] = condition(question_ids) if rand < 0.2
      [q, settings]
    end
    { 'pages' => pages, 'fields' => fields }
  end
end

File.write(ARGV.fetch(0), "#{JSON.generate(GenerateWalkerParity.new.call)}\n")
