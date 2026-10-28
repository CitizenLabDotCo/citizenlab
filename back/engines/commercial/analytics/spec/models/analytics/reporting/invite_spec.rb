# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::Invite do
  include ActiveJob::TestHelper

  let(:admin) { create(:admin) }

  def log_invite(inviter, invited_at: Time.zone.parse('2026-03-12 10:00'))
    create(:activity, item_type: 'Invite', item_id: SecureRandom.uuid, action: 'created', user: inviter, acted_at: invited_at)
  end

  it 'counts invitations and acceptances per day and inviter role, also after the invitations are deleted' do
    invites = create_list(:invite, 3, inviter: admin, created_at: Time.zone.parse('2026-03-12 10:00'))
    perform_enqueued_jobs(only: LogActivityJob) do
      invites.each { |invite| SideFxInviteService.new.after_create(invite, admin) }
      invites.first.update!(accepted_at: Time.zone.parse('2026-03-14 10:00'))
      SideFxInviteService.new.after_accept(invites.first)
    end
    Invite.find_each(&:destroy!) # as DeleteInvitesJob does 30 days after sending

    rows = described_class.all

    expect(rows.map { |row| [row.invited_date, row.inviter_role, row.govocal_staff, row.invites_count, row.accepted_count] })
      .to eq [[Date.new(2026, 3, 12), 'admin', false, 3, 1]]
    expect(described_class.column_names.grep(/_id\z/)).to be_empty
  end

  it 'gives the inviter role as reporting_staff_activities does' do
    log_invite(create(:admin, email: 'support@govocal.com'))
    log_invite(create(:user))
    log_invite(nil)

    expect(described_class.pluck(:inviter_role, :govocal_staff))
      .to contain_exactly(['admin', true], ['former_staff', false], [nil, false])
  end

  it 'puts invitations on days in the platform timezone' do
    settings = AppConfiguration.instance.settings
    settings['core']['timezone'] = 'America/New_York'
    AppConfiguration.instance.update_column(:settings, settings)
    log_invite(admin, invited_at: Time.utc(2026, 4, 1, 2)) # 31 March, 22:00 in New York

    expect(described_class.pick(:invited_date)).to eq Date.new(2026, 3, 31)
  end
end
