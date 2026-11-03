# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::Registration do
  include ActiveJob::TestHelper

  let(:started_at) { Time.zone.parse('2026-03-12 10:00') }

  def log_sign_up(payload, account_id: SecureRandom.uuid, acted_at: started_at)
    create(:activity, item_type: 'User', item_id: account_id, action: 'created', user: nil, acted_at: acted_at, payload: payload)
    account_id
  end

  def log_completed(account_id)
    create(:activity, item_type: 'User', item_id: account_id, action: 'completed_registration', user: nil, acted_at: started_at + 1.hour)
  end

  def rows
    described_class.order(:sign_up_method, :sso_provider).map do |row|
      [row.started_date, row.sign_up_method, row.sso_provider, row.started_count, row.completed_count]
    end
  end

  it 'counts sign-ups and completions, also for people whose unconfirmed account was deleted' do
    finished, stopped = create_list(:unconfirmed_user, 2, created_at: started_at)
    perform_enqueued_jobs(only: LogActivityJob) do
      [finished, stopped].each { |user| SideFxUserService.new.after_create(user, nil) }
      finished.update!(email_confirmed_at: Time.zone.now, confirmation_required: false) # as EmailConfirmation#confirm! does
      SideFxUserService.new.after_update(finished, finished)
    end
    stopped.destroy! # as ExpireConfirmationCodeOrDeleteJob does

    expect(rows).to eq [[Date.new(2026, 3, 12), 'email_confirmation', nil, 2, 1]]
  end

  it 'gives the sign-in service for sign-ups through one' do
    log_completed(log_sign_up({ 'flow' => 'sso', 'method' => 'google' }))
    log_sign_up({ 'flow' => 'sso', 'method' => 'franceconnect' })

    expect(rows).to eq [
      [Date.new(2026, 3, 12), 'sso', 'franceconnect', 1, 0],
      [Date.new(2026, 3, 12), 'sso', 'google', 1, 1]
    ]
  end

  it 'counts invitations, recognising older accepted invitees without the invitation flow' do
    log_sign_up({ 'flow' => 'invitation' })
    older_invitee = log_sign_up({ 'flow' => 'email_confirmation' })
    create(:activity, item_type: 'Invite', action: 'accepted', user_id: create(:user, id: older_invitee).id, acted_at: started_at + 1.day)
    log_completed(older_invitee)

    expect(rows).to eq [[Date.new(2026, 3, 12), 'invitation', nil, 2, 1]]
  end

  it 'gives no method for sign-ups from before the method was recorded' do
    log_sign_up({})

    expect(rows).to eq [[Date.new(2026, 3, 12), nil, nil, 1, 0]]
  end

  it 'leaves out authors created by an input import' do
    log_sign_up({ 'flow' => 'importer' })

    expect(described_class.all).to be_empty
  end

  it 'puts sign-ups on days in the platform timezone' do
    settings = AppConfiguration.instance.settings
    settings['core']['timezone'] = 'America/New_York'
    AppConfiguration.instance.update_column(:settings, settings)
    log_sign_up({ 'flow' => 'email_password' }, acted_at: Time.utc(2026, 4, 1, 2)) # 31 March, 22:00 in New York

    expect(described_class.pick(:started_date)).to eq Date.new(2026, 3, 31)
  end
end
