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

  describe 'voters' do
    let(:voting_phase) { create(:single_voting_phase) }
    let(:voting_row) { described_class.find(voting_phase.id) }

    it 'counts online voters as the voting results do, keeping voters whose picks were deleted' do
      kept, deleted = create_list(:idea, 2, project: voting_phase.project, phases: [voting_phase])
      create(:baskets_idea, basket: create(:basket, phase: voting_phase), idea: kept)
      create(:baskets_idea, basket: create(:basket, phase: voting_phase), idea: deleted)
      deleted.destroy!
      Basket.update_counts(voting_phase)

      expect(voting_row.online_voters_count).to eq 2
      expect(voting_row.online_voters_count).to eq voting_phase.reload.baskets_count
      expect(Analytics::Reporting::Contribution.where(type: 'vote', phase_id: voting_phase.id).distinct.count(:participant_id)).to eq 1
    end

    it 'exposes the offline voters an administrator entered' do
      voting_phase.set_manual_voters(3, create(:admin))
      voting_phase.save!

      expect(voting_row.manual_voters_amount).to eq 3
      expect(voting_row.manual_voters_last_updated_at).to eq voting_phase.reload.manual_voters_last_updated_at
    end

    it 'has no voters for other participation methods' do
      expect([row.online_voters_count, row.manual_voters_amount, row.manual_voters_last_updated_at]).to eq [0, nil, nil]
    end
  end

  it 'documents every possible participation method' do
    description = described_class.field_descriptions['participation_method']
    expect(description).to include(*Phase::PARTICIPATION_METHODS)
  end
end
