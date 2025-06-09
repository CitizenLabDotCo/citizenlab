class ProjectsFinderAdminService
  UUID_REGEX = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'

  # EXECUTION
  def self.execute(scope, params = {}, current_user: nil)
    # Apply filters
    projects = filter_status(scope, params)
    projects = filter_project_manager(projects, params)
    projects = search(projects, params)
    projects = filter_date(projects, params)

    # Apply sorting
    if params[:sort] == 'recently_viewed'
      sort_recently_viewed(projects, current_user)
    elsif params[:sort] == 'phase_starting_or_ending_soon'
      sort_phase_starting_or_ending_soon(projects)
    else
      projects.order(created_at: :desc)
    end
  end

  # The methods below are private class methods.
  # They are currently only used by the execute method,
  # but could be used in other places as well.
  # If you want to use any of them outside of this class,
  # remove the `private_class_method` modifier.

  # SORTING METHODS
  private_class_method def self.sort_recently_viewed(scope, current_user)
    substring_statement = "substring(path, 'admin/projects/(#{UUID_REGEX})')"

    # I first did this with a group by and max, but Copilot suggested
    # using a window function instead, which is more efficient
    recent_pageviews_sql = <<-SQL.squish
      SELECT
        #{substring_statement}::UUID AS admin_project_id,
        impact_tracking_pageviews.created_at AS last_viewed_at,
        ROW_NUMBER() OVER (
          PARTITION BY #{substring_statement}
          ORDER BY impact_tracking_pageviews.created_at DESC
        ) AS rn
      FROM impact_tracking_pageviews
      INNER JOIN impact_tracking_sessions
        ON impact_tracking_pageviews.session_id = impact_tracking_sessions.id
      WHERE path LIKE '%admin/projects/%'
        AND impact_tracking_sessions.user_id = '#{current_user.id}'
    SQL

    recent_pageviews_subquery = "(#{recent_pageviews_sql}) AS recent_pageviews"

    projects_subquery = scope
      .joins("LEFT JOIN #{recent_pageviews_subquery} ON recent_pageviews.admin_project_id = projects.id AND recent_pageviews.rn = 1")
      .select('recent_pageviews.last_viewed_at AS last_viewed_at, projects.*')

    # We order by last_viewed_at, but tie-break with created_at and id for a stable sort,
    # which is important for pagination
    Project
      .from(projects_subquery, :projects)
      .order('last_viewed_at DESC NULLS LAST, projects.created_at ASC, projects.id ASC')
  end

  private_class_method def self.sort_phase_starting_or_ending_soon(scope)
    phases_ending_soon_subquery = Phase
      .where("coalesce(end_at, 'infinity'::DATE) >= current_date")
      .group(:project_id)
      .select("project_id, min(coalesce(end_at, 'infinity'::DATE)) AS min_end_at")

    phases_starting_soon_subquery = Phase
      .where('start_at >= current_date')
      .group(:project_id)
      .select('project_id, min(start_at) AS min_start_at')

    projects_subquery = scope
      .joins("LEFT JOIN (#{phases_ending_soon_subquery.to_sql}) AS phases_ending_soon ON phases_ending_soon.project_id = projects.id")
      .joins("LEFT JOIN (#{phases_starting_soon_subquery.to_sql}) AS phases_starting_soon ON phases_starting_soon.project_id = projects.id")
      .select('least(phases_ending_soon.min_end_at, phases_starting_soon.min_start_at) AS soon_date, projects.*')

    # We order by soon_date, but tie-break with created_at and id for a stable sort,
    # which is important for pagination
    Project
      .from(projects_subquery, :projects)
      .order('soon_date ASC NULLS LAST, projects.created_at ASC, projects.id ASC')
  end

  # FILTERING METHODS
  private_class_method def self.filter_status(scope, params = {})
    status = params[:status] || []
    return scope unless status.present?
    scope
      .joins("INNER JOIN admin_publications ON admin_publications.publication_id = projects.id AND admin_publications.publication_type = 'Project'")
      .where(admin_publications: { publication_status: status })
  end

  private_class_method def self.filter_project_manager(scope, params = {})
    manager_ids = params[:managers] || []

    if manager_ids.present?
      managers = User.where(id: manager_ids)

      moderated_projects = []

      managers.each do |manager|
        manager.roles.each do |role|
          if role['type'] == 'project_moderator'
            moderated_projects << role['project_id']
          end
        end
      end

      scope.where(id: moderated_projects)
    else
      scope
    end
  end

  private_class_method def self.search(scope, params = {})
    search = params[:search] || ''

    if search.present?
      scope.search_by_title(search)
    else
      scope
    end
  end

  private_class_method def self.filter_date(scope, params = {})
    start_at = params[:start_at]
    end_at = params[:end_at]

    if start_at.present? || end_at.present?
      start_at ||= Date.new(1970, 1, 1)
      end_at ||= DateTime::Infinity

      overlapping_project_ids = Phase
        .select(:project_id)
        .where(
          "(start_at, coalesce(end_at, 'infinity'::DATE)) OVERLAPS (?, ?)",
          start_at, end_at
        )

      return scope.where(id: overlapping_project_ids)
    end

    scope
  end
end
