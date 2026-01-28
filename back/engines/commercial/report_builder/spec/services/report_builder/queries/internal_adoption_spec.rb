# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::InternalAdoption do
  subject(:query) { described_class.new(build(:user)) }

  describe '#run_query' do
    before do
      # Make TimeBoundariesParser work as expected
      AppConfiguration.instance.update!(created_at: Date.new(2021, 1, 1), platform_start_at: Date.new(2021, 1, 1))

      @date_september = Date.new(2022, 9, 10)
      @date_october = Date.new(2022, 10, 5)
    end

    it 'returns internal adoption metrics with correct counts and timeseries' do
      project = create(:project)

      # 2 admins with sessions in period (active)
      admin1 = create(:admin, created_at: @date_september - 10.days)
      admin2 = create(:admin, created_at: @date_september - 10.days)
      create(:session, created_at: @date_september, highest_role: 'admin', user_id: admin1.id)
      create(:session, created_at: @date_september, highest_role: 'admin', user_id: admin2.id)
      create(:session, created_at: @date_october, highest_role: 'admin', user_id: admin1.id)

      # 2 moderator with session in period (active)
      mod = create(:project_moderator, projects: [project], created_at: @date_september - 10.days)
      create(:session, created_at: @date_september, highest_role: 'project_moderator', user_id: mod.id)
      folder_mod = create(:project_moderator, projects: [project], created_at: @date_september - 10.days)
      create(:session, created_at: @date_september, highest_role: 'project_folder_moderator', user_id: folder_mod.id)

      # 1 moderator without sessions (registered but NOT active)
      create(:project_moderator, projects: [project], created_at: @date_september)

      # Users with sessions OUTSIDE period
      admin_after = create(:admin, created_at: @date_october + 2.days)
      mod_after = create(:project_moderator, projects: [project], created_at: @date_october + 2.days)
      create(:session, created_at: @date_october + 2.days, highest_role: 'admin', user_id: admin_after.id)
      create(:session, created_at: @date_october + 2.days, highest_role: 'project_moderator', user_id: mod_after.id)

      # Normal user with session
      normal_user = create(:user, created_at: @date_september)
      create(:session, created_at: @date_september, highest_role: 'user', user_id: normal_user.id)

      params = {
        start_at: @date_september - 1.day,
        end_at: @date_october + 1.day
      }

      expect(query.run_query(**params)).to eq({
        active_admins_count: 2,           # 2 admins with sessions in period
        active_moderators_count: 2,       # 2 moderators with sessions in period
        total_admin_pm_count: 5,          # 2 admins + 3 mods created before end_at
        timeseries: [
          { date_group: Date.new(2022, 9, 1), active_admins: 2, active_moderators: 2 },
          { date_group: Date.new(2022, 10, 1), active_admins: 1, active_moderators: 0 }
        ]
      })
    end

    it 'distinguishes between registered users and active users' do
      project = create(:project)

      # Users registered before the query period
      admin = create(:admin, created_at: @date_september - 10.days)
      mod = create(:project_moderator, projects: [project], created_at: @date_september - 10.days)

      # Sessions outside the queried period
      create(:session, created_at: @date_september - 10.days, highest_role: 'admin', user_id: admin.id)
      create(:session, created_at: @date_october + 2.days, highest_role: 'project_moderator', user_id: mod.id)

      params = {
        start_at: @date_september - 1.day,
        end_at: @date_october + 1.day
      }

      expect(query.run_query(**params)).to eq({
        active_admins_count: 0,           # No sessions in period
        active_moderators_count: 0,       # No sessions in period
        total_admin_pm_count: 2,          # Both registered before end_at
        timeseries: []
      })
    end

    it 'does not count users registered after end_date in total_admin_pm' do
      project = create(:project)

      # Users registered AFTER the query period
      admin = create(:admin, created_at: @date_october + 2.days)
      mod = create(:project_moderator, projects: [project], created_at: @date_october + 2.days)

      # Even with sessions after the period
      create(:session, created_at: @date_october + 3.days, highest_role: 'admin', user_id: admin.id)
      create(:session, created_at: @date_october + 3.days, highest_role: 'project_moderator', user_id: mod.id)

      params = {
        start_at: @date_september - 1.day,
        end_at: @date_october + 1.day
      }

      expect(query.run_query(**params)).to eq({
        active_admins_count: 0,
        active_moderators_count: 0,
        total_admin_pm_count: 0,
        timeseries: []
      })
    end

    it 'returns comparison period data when compare dates are provided' do
      project = create(:project)

      # Create users - all created before both periods
      date_in_august = Date.new(2022, 8, 20)
      admin1 = create(:admin, created_at: date_in_august)
      admin2 = create(:admin, created_at: date_in_august)
      admin3 = create(:admin, created_at: date_in_august)
      mod1 = create(:project_moderator, projects: [project], created_at: date_in_august)
      mod2 = create(:project_moderator, projects: [project], created_at: date_in_august)
      mod3 = create(:project_moderator, projects: [project], created_at: date_in_august)

      # Main period sessions (Sept): 2 admins, 1 moderator active
      create(:session, created_at: @date_september, highest_role: 'admin', user_id: admin1.id)
      create(:session, created_at: @date_september, highest_role: 'admin', user_id: admin2.id)
      create(:session, created_at: @date_september, highest_role: 'project_moderator', user_id: mod1.id)

      # Comparison period sessions (Oct): 1 admin, 2 moderators active
      create(:session, created_at: @date_october, highest_role: 'admin', user_id: admin3.id)
      create(:session, created_at: @date_october, highest_role: 'project_moderator', user_id: mod2.id)
      create(:session, created_at: @date_october, highest_role: 'project_moderator', user_id: mod3.id)

      params = {
        start_at: @date_september - 1.day,
        end_at: @date_september + 1.day,
        compare_start_at: @date_october - 1.day,
        compare_end_at: @date_october + 1.day
      }

      expect(query.run_query(**params)).to eq({
        # Main period (September)
        active_admins_count: 2,
        active_moderators_count: 1,
        total_admin_pm_count: 6,
        timeseries: [
          { date_group: Date.new(2022, 9, 1), active_admins: 2, active_moderators: 1 }
        ],
        # Comparison period (October)
        active_admins_compared: 1,
        active_moderators_compared: 2,
        total_admin_pm_compared: 6
      })
    end
  end
end
