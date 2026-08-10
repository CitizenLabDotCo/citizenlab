# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::ProposalStatusResolver do
  let(:ref_map) { DecidimImporter::RefMap.new }
  let(:mapping) do
    DecidimImporter::StatusMapper::Result.new(
      custom_statuses: [{ 'id' => 'feasible', 'title_multiloc' => { 'fr-FR' => 'Idée faisable' },
                          'description_multiloc' => { 'fr-FR' => 'Réalisable' }, 'color' => '#123456' }],
      decisions: {
        'viable|Idée faisable' => { target: 'custom', custom_status_id: 'feasible' },
        'accepted|Retenue' => { target: 'standard', code: 'accepted' }
      }
    )
  end
  let(:locale_mapper) { DecidimImporter::LocaleMapper.new }
  let(:mapper) { instance_double(DecidimImporter::StatusMapper) }

  # component-42: `viable` (used) → custom, `accepted` (used) → standard; `preselected` (unused, count 0).
  let(:state_rows) do
    [
      { 'decidim_component' => 'component-42', 'token' => 'viable', 'proposals_count' => '34',
        'title' => '{"fr":"Idée faisable"}' },
      { 'decidim_component' => 'component-42', 'token' => 'accepted', 'proposals_count' => '3',
        'title' => '{"fr":"Retenue"}' },
      { 'decidim_component' => 'component-42', 'token' => 'preselected', 'proposals_count' => '0',
        'title' => '{"fr":"Présélection"}' }
    ]
  end

  def build(result)
    allow(mapper).to receive(:map).and_return(result)
    described_class.new(state_rows, ref_map, locale_mapper: locale_mapper, primary_locale: 'fr-FR', mapper: mapper).build!
  end

  it 'sends only the used states (dropping proposals_count 0), aggregated by key, to the mapper' do
    expect(mapper).to receive(:map).with(
      a_collection_containing_exactly(
        include('key' => 'viable|Idée faisable', 'count' => 34, 'tokens' => ['viable']),
        include('key' => 'accepted|Retenue', 'count' => 3, 'tokens' => ['accepted'])
      )
    ).and_return(mapping)

    described_class.new(state_rows, ref_map, locale_mapper: locale_mapper, primary_locale: 'fr-FR', mapper: mapper).build!
  end

  it 'registers a custom idea_status record for each custom status the mapper returns' do
    build(mapping)

    record = ref_map.fetch('decidim-status-custom-feasible')
    expect(record.model_name).to eq('idea_status')
    expect(record.attributes).to include(
      'title_multiloc' => { 'fr-FR' => 'Idée faisable' }, 'code' => 'custom',
      'participation_method' => 'ideation', 'color' => '#123456'
    )
    expect(record.attributes['ordering']).to eq(described_class::CUSTOM_ORDERING_BASE)
  end

  it 'resolves a custom-mapped state to a reference to its idea_status record + the original title' do
    resolver = build(mapping)
    decision = resolver.resolve('component-42', 'viable')

    expect(decision.idea_status_code).to be_nil
    expect(decision.idea_status_record).to be(ref_map.fetch('decidim-status-custom-feasible'))
    expect(decision.original_title_multiloc).to eq('fr-FR' => 'Idée faisable')
    expect(decision.token).to eq('viable')
  end

  it 'resolves a standard-mapped state to its code + the original title' do
    resolver = build(mapping)
    decision = resolver.resolve('component-42', 'accepted')

    expect(decision.idea_status_record).to be_nil
    expect(decision.idea_status_code).to eq('accepted')
    expect(decision.original_title_multiloc).to eq('fr-FR' => 'Retenue')
  end

  it 'falls back to the token heuristic for a state the mapper never decided (e.g. unused/unknown)' do
    resolver = build(mapping)

    # `preselected` was unused → never mapped; `evaluating` isn't a state here at all.
    expect(resolver.resolve('component-42', 'preselected').idea_status_code).to eq('proposed')
    expect(resolver.resolve('component-42', 'evaluating').idea_status_code).to eq('under_consideration')
    expect(resolver.resolve('unknown-component', 'accepted').idea_status_code).to eq('accepted')
  end

  it 'copes with no state rows at all (older exports): no mapper customs, pure heuristic' do
    allow(mapper).to receive(:map).and_return(DecidimImporter::StatusMapper::Result.new(custom_statuses: [], decisions: {}))
    resolver = described_class.new([], ref_map, locale_mapper: locale_mapper, mapper: mapper).build!

    decision = resolver.resolve('any', 'rejected')
    expect(decision.idea_status_code).to eq('rejected')
    expect(decision.original_title_multiloc).to be_nil
    expect(resolver.custom_status_records).to be_empty
  end
end
