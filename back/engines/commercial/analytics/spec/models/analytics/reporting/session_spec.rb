# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::Session do
  it 'uses the user id as visitor identity for signed-in sessions' do
    user = create(:user)
    session = create(:session, user_id: user.id, highest_role: 'user')
    row = described_class.find(session.id)

    expect(row.user_id).to eq user.id
    expect(row.visitor_id).to eq user.id
    expect(row.highest_role).to eq 'user'
  end

  it 'falls back to the anonymous hash for signed-out sessions' do
    session = create(:session)
    row = described_class.find(session.id)

    expect(row.user_id).to be_nil
    expect(row.anonymous_id).to eq session.monthly_user_hash
    expect(row.visitor_id).to eq session.monthly_user_hash
    expect(row.highest_role).to be_nil
  end

  it 'exposes session start, device and referrer' do
    session = create(:session, device_type: 'mobile', referrer: 'https://www.google.com/')
    row = described_class.find(session.id)

    expect(row.started_at).to eq session.created_at
    expect(row.device).to eq 'mobile'
    expect(row.referrer).to eq 'https://www.google.com/'
  end
end
