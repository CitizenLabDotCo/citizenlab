# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::InputStatusChange do
  let(:idea) { create(:idea) }
  let(:from_status) { create(:idea_status, code: 'proposed', title_multiloc: { 'en' => 'Proposed' }) }
  let(:to_status) { create(:idea_status, code: 'accepted', title_multiloc: { 'en' => 'Accepted' }) }

  it 'exposes the statuses before and after a change, and when it happened' do
    activity = create(
      :changed_status_activity,
      item: idea,
      acted_at: Time.zone.parse('2026-03-12 10:00'),
      payload: { 'change' => [from_status.id, to_status.id] }
    )
    row = described_class.find(activity.id)

    expect(row).to have_attributes(
      input_id: idea.id,
      from_status_id: from_status.id,
      from_status_label: 'Proposed',
      from_status_code: 'proposed',
      to_status_id: to_status.id,
      to_status_label: 'Accepted',
      to_status_code: 'accepted',
      changed_at: Time.zone.parse('2026-03-12 10:00')
    )
  end

  it 'resolves the older automatic proposal format by status code' do
    proposed = create(:proposals_status, code: 'proposed', title_multiloc: { 'en' => 'Proposed' })
    threshold_reached = create(:proposal_status_threshold_reached)
    activity = create(
      :activity,
      item: idea,
      action: 'changed_input_status',
      user: nil,
      payload: { 'input_status_from_code' => 'proposed', 'input_status_to_code' => 'threshold_reached' }
    )
    row = described_class.find(activity.id)

    expect(row).to have_attributes(
      from_status_id: proposed.id,
      from_status_code: 'proposed',
      to_status_id: threshold_reached.id,
      to_status_label: 'Threshold reached',
      to_status_code: 'threshold_reached'
    )
  end

  it 'keeps a change to a status that was deleted since, without its id and label' do
    activity = create(:changed_status_activity, item: idea, payload: { 'change' => [SecureRandom.uuid, to_status.id] })
    row = described_class.find(activity.id)

    expect(row).to have_attributes(from_status_id: nil, from_status_label: nil, from_status_code: nil)
    expect(row.to_status_id).to eq to_status.id
  end

  it 'excludes status changes on draft inputs' do
    draft = create(:idea, publication_status: 'draft')
    activity = create(:changed_status_activity, item: draft, payload: { 'change' => [from_status.id, to_status.id] })

    expect(described_class.where(id: activity.id)).to be_empty
  end

  it 'ignores other activities on inputs' do
    activity = create(:idea_published_activity, item: idea)

    expect(described_class.where(id: activity.id)).to be_empty
  end
end
