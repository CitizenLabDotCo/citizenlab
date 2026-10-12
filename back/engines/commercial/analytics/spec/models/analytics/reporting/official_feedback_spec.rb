# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::OfficialFeedback do
  it 'exposes the feedback text, author and date' do
    feedback = create(
      :official_feedback,
      body_multiloc: { 'en' => '<p>Approved by the council.</p>' },
      author_multiloc: { 'en' => 'City council' }
    )
    row = described_class.find(feedback.id)

    expect(row.input_id).to eq feedback.idea_id
    expect(row.body).to eq '<p>Approved by the council.</p>'
    expect(row.author).to eq 'City council'
    expect(row.user_id).to eq feedback.user_id
    expect(row.created_at).to be_within(1.second).of(feedback.created_at)
  end

  it 'falls back to another locale when the primary locale is missing' do
    feedback = create(
      :official_feedback,
      body_multiloc: { 'nl-BE' => '<p>Goedgekeurd.</p>' },
      author_multiloc: { 'nl-BE' => 'Gemeenteraad' }
    )
    row = described_class.find(feedback.id)

    expect(row.body).to eq '<p>Goedgekeurd.</p>'
    expect(row.author).to eq 'Gemeenteraad'
  end

  it 'excludes feedback on draft inputs' do
    feedback = create(:official_feedback, idea: create(:idea, publication_status: 'draft'))

    expect(described_class.where(id: feedback.id)).to be_empty
  end
end
