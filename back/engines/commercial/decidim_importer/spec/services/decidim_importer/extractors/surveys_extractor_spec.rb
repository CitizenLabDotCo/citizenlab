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
      question(17, 'matrix_single')
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
    expect(by_key).not_to have_key('field_17') # matrix_single has no template-safe equivalent

    field11 = records('custom_field').find { |f| f.attributes['key'] == 'field_11' }
    field11_options = records('custom_field_option')
      .select { |o| o.attributes['custom_field_ref'].equal?(field11.attributes) }
    expect(field11_options.map { |o| o.attributes['title_multiloc']['fr-FR'] }).to eq(%w[Oui Non])

    expect(extractor.skipped.first[:reason]).to include('matrix_single')
  end

  it 'skips a survey whose phase was not created' do
    extractor = described_class.new(
      [{ 'uid' => 'missing', 'specific_data' => '[]' }], ref_map, locale_mapper: mapper, primary_locale: 'fr-FR'
    )
    expect(extractor.run).to be_empty
    expect(extractor.skipped.first).to include(uid: 'missing')
  end
end
