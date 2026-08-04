# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::Phase do
  subject(:row) { described_class.find(phase.id) }

  let!(:phase) do
    create(
      :phase,
      title_multiloc: { 'en' => 'Gather ideas', 'nl-BE' => 'Ideeën verzamelen' },
      start_at: '2026-01-01',
      end_at: '2026-01-31'
    )
  end

  it 'exposes one row per phase with its project and method' do
    expect(row.project_id).to eq phase.project_id
    expect(row.participation_method).to eq 'ideation'
    expect(row.start_at).to eq phase.start_at
    expect(row.end_at).to eq phase.end_at
    expect(row.title_multiloc).to eq phase.title_multiloc
    expect(row.created_at).to eq phase.reload.created_at
  end

  describe 'title' do
    it 'resolves to the tenant primary locale' do
      expect(row.title).to eq 'Gather ideas'
    end

    it 'falls back to another locale when the primary locale is missing' do
      phase.update_column(:title_multiloc, { 'nl-BE' => 'Ideeën verzamelen' })

      expect(row.title).to eq 'Ideeën verzamelen'
    end
  end

  it 'keeps end_at NULL for an open-ended phase' do
    phase.update!(end_at: nil)

    expect(row.end_at).to be_nil
  end

  it 'documents every possible participation method' do
    description = described_class.field_descriptions['participation_method']
    expect(description).to include(*Phase::PARTICIPATION_METHODS)
  end
end
