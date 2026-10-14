# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::StaffActivity do
  let(:project) { create(:project) }
  let(:admin) { create(:admin) }
  let(:moderator) { create(:project_moderator, projects: [project]) }

  def log(item_type, action, user, acted_at: Time.zone.parse('2026-03-12 10:00'), **attributes)
    create(:activity, item_type: item_type, action: action, user: user, acted_at: acted_at, project_id: project.id, **attributes)
  end

  it 'counts staff actions per day, project, role and activity, without saying who' do
    log('OfficialFeedback', 'created', admin)
    log('OfficialFeedback', 'created', create(:admin))
    log('Idea', 'changed_status', moderator)

    rows = described_class.order(:activity, :role)

    expect(rows.map { |row| [row.activity_date, row.project_id, row.role, row.activity, row.activity_count] }).to eq [
      [Date.new(2026, 3, 12), project.id, 'project_moderator', 'input_status_changed', 1],
      [Date.new(2026, 3, 12), project.id, 'admin', 'official_feedback_posted', 2]
    ]
    expect(described_class.column_names.grep(/user/)).to be_empty
  end

  it 'leaves out actions residents can take too' do
    log('Idea', 'changed', admin)
    log('Idea', 'created', admin)
    log('Comment', 'created', admin)

    expect(described_class.all).to be_empty
  end

  it 'counts only comments a manager removed with a reason, not authors deleting their own' do
    log('Comment', 'marked_as_deleted', admin, payload: { 'reason_code' => 'irrelevant' })
    log('Comment', 'marked_as_deleted', create(:user), payload: { 'reason_code' => nil })

    expect(described_class.pluck(:activity, :activity_count)).to eq [['comment_removed', 1]]
  end

  it 'tells former staff and unrecorded people apart' do
    log('Idea', 'changed_status', create(:user))
    log('Idea', 'changed_status', nil)

    expect(described_class.pluck(:role)).to contain_exactly('former_staff', nil)
  end

  it "flags Go Vocal's own staff like User.citizenlab_member" do
    govocal_admin = create(:admin, email: 'support@govocal.com')
    log('Project', 'created', govocal_admin)
    log('Project', 'created', admin)

    view_govocal_staff = described_class.pluck(:govocal_staff, :activity_count).to_h
    citizenlab_members = User.citizenlab_member.where(id: [govocal_admin.id, admin.id])

    expect(citizenlab_members).to eq [govocal_admin]
    expect(view_govocal_staff).to eq(true => 1, false => 1)
  end

  it 'puts actions on days in the platform timezone' do
    settings = AppConfiguration.instance.settings
    settings['core']['timezone'] = 'America/New_York'
    AppConfiguration.instance.update_column(:settings, settings)
    log('Phase', 'created', admin, acted_at: Time.utc(2026, 4, 1, 2)) # 31 March, 22:00 in New York

    expect(described_class.pick(:activity_date)).to eq Date.new(2026, 3, 31)
  end

  it 'documents every activity the view counts' do
    sql = Rails.root.join('db/views/reporting_staff_activities_v01.sql').read
    view_activities = sql.scan(/^\s+\('[^']+', '[^']+', '(\w+)'\)/).flatten

    expect(view_activities).to match_array described_class::ACTIVITIES
  end
end
