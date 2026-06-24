# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::Extractors::SurveyResponsesExtractor do
  let(:ref_map) { DecidimImporter::RefMap.new }
  let(:mapper) { DecidimImporter::LocaleMapper.new }
  let(:process_uid) { 'decidim--participatory-process--1' }
  let(:component_uid) { 'decidim--component--1' }
  let(:project) { DecidimImporter::Record.new('project', { 'title_multiloc' => { 'fr-FR' => 'P' } }) }
  let(:phase) { DecidimImporter::Record.new('phase', { 'participation_method' => 'native_survey' }) }
  let(:user) { DecidimImporter::Record.new('user', { 'email' => 'a@example.org' }) }

  before do
    ref_map.register(process_uid, project)
    ref_map.register(component_uid, phase)
    ref_map.register('decidim--user--5', user)
  end

  def opt(id)
    { 'id' => id, 'body' => { 'fr' => id } }
  end

  def question(id, type, overrides = {})
    { 'id' => id, 'position' => id.split('--').last.to_i, 'question_type' => type,
      'body' => { 'fr' => "Q#{id}" }, 'answer_options' => [] }.merge(overrides)
  end

  # A questionnaire exercising every supported answer type, in the newer (UID, unwrapped) export shape.
  def questions
    [
      question('decidim--forms--question--10', 'short_answer'),
      question('decidim--forms--question--11', 'single_option',
        'answer_options' => [opt('decidim--forms--answer-option--20'), opt('decidim--forms--answer-option--21')]),
      question('decidim--forms--question--12', 'multiple_option',
        'answer_options' => [opt('decidim--forms--answer-option--22'), opt('decidim--forms--answer-option--23')]),
      question('decidim--forms--question--13', 'sorting',
        'answer_options' => [opt('decidim--forms--answer-option--24'), opt('decidim--forms--answer-option--25')]),
      question('decidim--forms--question--14', 'matrix_single',
        'answer_options' => [opt('decidim--forms--answer-option--40'), opt('decidim--forms--answer-option--41'),
          opt('decidim--forms--answer-option--42')],
        'matrix_rows' => [{ 'id' => 'decidim--forms--question-matrix-row--30', 'position' => 0, 'body' => { 'fr' => 'R1' } },
          { 'id' => 'decidim--forms--question-matrix-row--31', 'position' => 1, 'body' => { 'fr' => 'R2' } }]),
      question('decidim--forms--question--15', 'files')
    ]
  end

  def component_row
    { 'uid' => component_uid, 'specific_data' => [questions].to_json }
  end

  def extract(answer_rows)
    described_class.new(
      answer_rows, ref_map, locale_mapper: mapper, primary_locale: 'fr-FR', survey_components: [component_row]
    ).run
  end

  def choice(option_id, position: nil, custom_body: nil)
    { 'answer_option' => option_id, 'position' => position, 'body' => 'x', 'custom_body' => custom_body }
  end

  def answer_row(answers = {})
    {
      'decidim_participatory_process' => process_uid, 'decidim_component' => component_uid,
      'author' => 'decidim--user--5', 'created_at' => '2022-11-16 19:08:17 +0100'
    }.merge(answers)
  end

  it 'creates a published idea bound to the survey phase, project and author' do
    idea = extract([answer_row]).first

    expect(idea.model_name).to eq('idea')
    expect(idea.attributes).to include('publication_status' => 'published', 'created_at' => '2022-11-16 19:08:17 +0100')
    expect(idea.attributes['project_ref']).to be(project.attributes)
    expect(idea.attributes['creation_phase_ref']).to be(phase.attributes)
    expect(idea.attributes['author_ref']).to be(user.attributes)
  end

  it 'leaves the author nil (never anonymous) when the user was not imported' do
    idea = extract([answer_row('author' => 'decidim--user--999')]).first
    expect(idea.attributes).not_to have_key('author_ref')
    expect(idea.attributes).not_to have_key('anonymous')
  end

  it 'encodes a text answer verbatim' do
    cfv = extract([answer_row('decidim--forms--question--10' => 'Bonjour')]).first.attributes['custom_field_values']
    expect(cfv).to eq('field_10' => 'Bonjour')
  end

  it 'encodes single and multiple choice as option keys, with custom_body as the _other companion' do
    row = answer_row(
      'decidim--forms--question--11' => [choice('decidim--forms--answer-option--21', custom_body: 'Autre chose')].to_json,
      'decidim--forms--question--12' => [choice('decidim--forms--answer-option--22'),
        choice('decidim--forms--answer-option--23')].to_json
    )
    cfv = extract([row]).first.attributes['custom_field_values']

    expect(cfv['field_11']).to eq('option_21')
    expect(cfv['field_11_other']).to eq('Autre chose')
    expect(cfv['field_12']).to eq(%w[option_22 option_23])
  end

  it 'orders a ranking answer by position' do
    row = answer_row('decidim--forms--question--13' => [
      choice('decidim--forms--answer-option--25', position: 1), choice('decidim--forms--answer-option--24', position: 0)
    ].to_json)
    cfv = extract([row]).first.attributes['custom_field_values']
    expect(cfv['field_13']).to eq(%w[option_24 option_25])
  end

  it 'encodes a matrix answer as statement_key => 1-based scale point' do
    row = answer_row('decidim--forms--question--14' => [
      { 'decidim--forms--question-matrix-row--30' => [choice('decidim--forms--answer-option--41')] },
      { 'decidim--forms--question-matrix-row--31' => [choice('decidim--forms--answer-option--42')] }
    ].to_json)
    cfv = extract([row]).first.attributes['custom_field_values']
    # option 41 is the 2nd scale column, option 42 the 3rd.
    expect(cfv['field_14']).to eq('statement_30' => 2, 'statement_31' => 3)
  end

  it 'turns a file answer into a file_upload record referenced by { id, name }' do
    url = 'https://storage.example/opaque-token?response-content-disposition=inline%3B%20filename%3D%22plan.pdf%22'
    idea = extract([answer_row('decidim--forms--question--15' => [url].to_json)]).first

    file = ref_map.records.find { |r| r.model_name == 'file_upload' }
    expect(file.attributes).to include('name' => 'plan.pdf', 'remote_file_url' => url)
    expect(file.attributes['idea_ref']).to be(idea.attributes)
    expect(idea.attributes['custom_field_values']['field_15']).to eq('id' => file.attributes['id'], 'name' => 'plan.pdf')
  end

  it 'skips a response whose survey phase is missing' do
    result = extract([answer_row('decidim_component' => 'decidim--component--999')])
    expect(result).to be_empty
  end
end
