# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::Invite do
  let(:admin) { create(:admin) }

  it 'counts invitations and acceptances per day and inviter role, without saying who' do
    invited_at = Time.zone.parse('2026-03-12 10:00')
    create(:invite, inviter: admin, created_at: invited_at, accepted_at: invited_at + 2.days)
    create(:invite, inviter: admin, created_at: invited_at)
    create(:invite, inviter: admin, created_at: invited_at, send_invite_email: false)

    rows = described_class.order(:email_sent)

    expect(rows.map { |row| [row.invited_date, row.inviter_role, row.govocal_staff, row.email_sent, row.invites_count, row.accepted_count] }).to eq [
      [Date.new(2026, 3, 12), 'admin', false, false, 1, 0],
      [Date.new(2026, 3, 12), 'admin', false, true, 2, 1]
    ]
    expect(described_class.column_names.grep(/_id\z/)).to be_empty
  end

  it 'gives the inviter role as reporting_staff_activities does' do
    create(:invite, inviter: create(:admin, email: 'support@govocal.com'))
    create(:invite, inviter: create(:user))
    create(:invite, inviter: nil)

    expect(described_class.pluck(:inviter_role, :govocal_staff))
      .to contain_exactly(['admin', true], ['former_staff', false], [nil, false])
  end

  it 'puts invitations on days in the platform timezone' do
    settings = AppConfiguration.instance.settings
    settings['core']['timezone'] = 'America/New_York'
    AppConfiguration.instance.update_column(:settings, settings)
    create(:invite, inviter: admin, created_at: Time.utc(2026, 4, 1, 2)) # 31 March, 22:00 in New York

    expect(described_class.pick(:invited_date)).to eq Date.new(2026, 3, 31)
  end
end
