# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::Extractors::SurveysExtractor do
  let(:ref_map) { DecidimImporter::RefMap.new }
  let(:mapper) { DecidimImporter::LocaleMapper.new }
  let(:component_uid) { 'decidim-component-1' }
  let(:phase) { DecidimImporter::Record.new('phase', { 'participation_method' => 'native_survey' }) }

  before { ref_map.register(component_uid, phase) }

  def run(questions)
    described_class.new([component(questions)], ref_map, locale_mapper: mapper, primary_locale: 'fr-FR').run
  end

  def component(questions)
    specific = [{ 'questionnaire' => { 'title' => { 'fr' => 'Q' }, 'questions' => questions } }].to_json
    { 'uid' => component_uid, 'specific_data' => specific }
  end

  def question(id, type, overrides = {})
    { 'id' => id, 'position' => id, 'question_type' => type, 'mandatory' => false,
      'body' => { 'fr' => "Q#{id}" }, 'description' => { 'fr' => '' }, 'answer_options' => [] }.merge(overrides)
  end

  def records(model)
    ref_map.records.select { |r| r.model_name == model }
  end

  it 'binds a custom_form to the phase and wraps questions in a start and end page' do
    run([question(10, 'short_answer')])

    form = records('custom_form').first
    expect(form.attributes['participation_context_ref']).to be(phase.attributes)
    expect(records('custom_field').map { |f| [f.attributes['key'], f.attributes['input_type']] })
      .to eq([%w[page1 page], %w[field_10 text], %w[form_end page]])
  end

  it 'maps each question type, attaches options for choice questions, and skips unsupported types' do
    options = [{ 'id' => 1, 'body' => { 'fr' => 'Oui' } }, { 'id' => 2, 'body' => { 'fr' => 'Non' } }]
    extractor = described_class.new([component([
      question(11, 'single_option', 'mandatory' => true, 'answer_options' => options),
      question(12, 'multiple_option'),
      question(13, 'long_answer'),
      question(14, 'sorting'),
      question(15, 'files'),
      question(16, 'title_and_description'),
      question(17, 'matrix_multiple')
    ])], ref_map, locale_mapper: mapper, primary_locale: 'fr-FR')
    extractor.run

    by_key = records('custom_field').map(&:attributes).index_by { |f| f['key'] }
    expect(by_key['field_11']['input_type']).to eq('select')
    expect(by_key['field_11']['required']).to be(true)
    expect(by_key['field_12']['input_type']).to eq('multiselect')
    expect(by_key['field_13']['input_type']).to eq('multiline_text')
    expect(by_key['field_14']['input_type']).to eq('ranking')
    expect(by_key['field_15']['input_type']).to eq('file_upload')
    expect(by_key['field_16']['input_type']).to eq('page')
    expect(by_key).not_to have_key('field_17') # matrix_multiple has no native-survey equivalent

    field11 = records('custom_field').find { |f| f.attributes['key'] == 'field_11' }
    field11_options = records('custom_field_option')
      .select { |o| o.attributes['custom_field_ref'].equal?(field11.attributes) }
    expect(field11_options.map { |o| o.attributes['title_multiloc']['fr-FR'] }).to eq(%w[Oui Non])

    expect(extractor.skipped.first[:reason]).to include('matrix_multiple')
  end

  it 'maps matrix_single to a matrix_linear_scale: columns as scale points, rows as placeholders' do
    columns = [{ 'id' => 1, 'body' => { 'fr' => 'Oui' } }, { 'id' => 2, 'body' => { 'fr' => 'Non' } }]
    run([question(20, 'matrix_single', 'matrix_rows_count' => 3, 'answer_options' => columns)])

    field = records('custom_field').find { |f| f.attributes['key'] == 'field_20' }
    expect(field.attributes['input_type']).to eq('matrix_linear_scale')
    expect(field.attributes['maximum']).to eq(2)
    expect(field.attributes['linear_scale_label_1_multiloc']).to eq('fr-FR' => 'Oui')
    expect(field.attributes['linear_scale_label_2_multiloc']).to eq('fr-FR' => 'Non')

    statements = records('custom_field_matrix_statement')
      .select { |s| s.attributes['custom_field_ref'].equal?(field.attributes) }
    expect(statements.map { |s| s.attributes['key'] }).to eq(%w[statement_1 statement_2 statement_3])
    # Row text isn't in the export, so rows are bracketed placeholders to relabel.
    expect(statements.map { |s| s.attributes['title_multiloc'] })
      .to eq([{ 'fr-FR' => '[1]' }, { 'fr-FR' => '[2]' }, { 'fr-FR' => '[3]' }])
  end

  it 'skips a matrix whose scale size is outside the supported range' do
    extractor = described_class.new(
      [component([question(21, 'matrix_single', 'answer_options' => [{ 'id' => 1, 'body' => { 'fr' => 'x' } }])])],
      ref_map, locale_mapper: mapper, primary_locale: 'fr-FR'
    )
    extractor.run

    expect(records('custom_field').map { |f| f.attributes['key'] }).not_to include('field_21')
    expect(extractor.skipped.first[:reason]).to include('matrix scale')
  end

  it 'skips a survey whose phase was not created' do
    extractor = described_class.new(
      [{ 'uid' => 'missing', 'specific_data' => '[]' }], ref_map, locale_mapper: mapper, primary_locale: 'fr-FR'
    )
    expect(extractor.run).to be_empty
    expect(extractor.skipped.first).to include(uid: 'missing')
  end

  it 'reads the newer unwrapped, UID-keyed shape and builds real matrix rows from matrix_rows' do
    columns = [{ 'id' => 'decidim--forms--answer-option--40', 'body' => { 'fr' => 'Souvent' } },
      { 'id' => 'decidim--forms--answer-option--41', 'body' => { 'fr' => 'Jamais' } }]
    matrix_rows = [{ 'id' => 'decidim--forms--question-matrix-row--30', 'position' => 0, 'body' => { 'fr' => 'Parc A' } },
      { 'id' => 'decidim--forms--question-matrix-row--31', 'position' => 1, 'body' => { 'fr' => 'Parc B' } }]
    questions = [
      { 'id' => 'decidim--forms--question--46', 'position' => 0, 'question_type' => 'short_answer', 'body' => { 'fr' => 'Q' } },
      { 'id' => 'decidim--forms--question--47', 'position' => 1, 'question_type' => 'matrix_single',
        'answer_options' => columns, 'matrix_rows' => matrix_rows, 'body' => { 'fr' => 'M' } }
    ]
    # Newer shape: the questions array is the single top-level entry (no `questionnaire` wrapper).
    described_class.new([{ 'uid' => component_uid, 'specific_data' => [questions].to_json }],
      ref_map, locale_mapper: mapper, primary_locale: 'fr-FR').run

    expect(records('custom_field').map { |f| f.attributes['key'] }).to include('field_46', 'field_47')

    field = records('custom_field').find { |f| f.attributes['key'] == 'field_47' }
    statements = records('custom_field_matrix_statement')
      .select { |s| s.attributes['custom_field_ref'].equal?(field.attributes) }
    # Real rows now: keyed by the row reference, labelled from the export (no placeholders).
    expect(statements.map { |s| s.attributes['key'] }).to eq(%w[statement_30 statement_31])
    expect(statements.map { |s| s.attributes['title_multiloc'] }).to eq([{ 'fr-FR' => 'Parc A' }, { 'fr-FR' => 'Parc B' }])
  end
end
