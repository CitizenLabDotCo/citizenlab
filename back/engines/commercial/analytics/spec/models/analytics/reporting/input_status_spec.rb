# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::InputStatus do
  it 'exposes the current status of an input with label and code' do
    status = create(:idea_status, code: 'accepted', title_multiloc: { 'en' => 'Approved', 'nl-BE' => 'Goedgekeurd' })
    idea = create(:idea, idea_status: status)
    row = described_class.find(idea.id)

    expect(row.status_id).to eq status.id
    expect(row.status_label).to eq 'Approved'
    expect(row.status_code).to eq 'accepted'
  end

  it 'has no row for draft inputs' do
    status = create(:idea_status)
    create(:idea, idea_status: status, publication_status: 'draft')

    expect(described_class.where(status_id: status.id)).to be_empty
  end
end
