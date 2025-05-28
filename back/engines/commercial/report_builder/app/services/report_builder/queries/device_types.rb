module ReportBuilder
  class Queries::DeviceTypes < ReportBuilder::Queries::Base
    def run_query(
      start_at: nil,
      end_at: nil,
      project_id: nil,
      exclude_roles: nil,
      **_other_props
    )
      start_date, end_date = TimeBoundariesParser.new(start_at, end_at).parse

      sessions = ImpactTracking::Session.where(created_at: start_date..end_date)
      sessions = apply_project_filter_if_needed(sessions, project_id)
      sessions = exclude_roles_if_needed(sessions, exclude_roles)

      counts_per_device_type = sessions
        .where.not(device_type: nil)
        .group(:device_type)
        .count

      {
        counts_per_device_type: counts_per_device_type
      }
    end

    def apply_project_filter_if_needed(sessions, project_id)
      if project_id.present?
        sessions_with_project = ImpactTracking::Pageview.where(project_id: project_id).select(:session_id)
        sessions = sessions.where(id: sessions_with_project)
      end

      sessions
    end

    def exclude_roles_if_needed(sessions, exclude_roles)
      if exclude_roles == 'exclude_admins_and_moderators'
        sessions = sessions
          .where("highest_role IS NULL OR highest_role = 'user'")
      end

      sessions
    end
  end
end
