class ProjectsFinderAdminService
  UUID_REGEX = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'

  # EXECUTION
  def self.execute(scope, params = {}, current_user: nil)
    # Apply filters
    projects = filter_status(scope, params)
    projects = filter_by_folder_ids(projects, params)
    projects = filter_project_manager(projects, params)
    projects = search(projects, params)
    projects = filter_start_date(projects, params)
    projects = filter_participation_states(projects, params)
    projects = filter_current_phase_participation_method(projects, params)
    projects = filter_visibility(projects, params)
    projects = filter_discoverability(projects, params)

    # Apply sorting
    case params[:sort]
    when 'recently_viewed'
      sort_recently_viewed(projects, current_user)
    when 'phase_starting_or_ending_soon'
      sort_phase_starting_or_ending_soon(projects)
    when 'alphabetically_asc', 'alphabetically_desc'
      sort_alphabetically(projects, params)
    else
      projects.order('projects.created_at DESC, projects.id ASC')
    end
  end

  # The methods below are private class methods.
  # They are currently only used by the execute method,
  # but could be used in other places as well.

  # SORTING METHODS
  def self.sort_recently_viewed(scope, current_user)
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

  def self.sort_phase_starting_or_ending_soon(scope)
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

  def self.sort_alphabetically(scope, params)
    locale = params[:locale] || 'en'
    direction = params[:sort] == 'alphabetically_desc' ? 'DESC' : 'ASC'

    scope.order(
      Arel.sql("projects.title_multiloc->>'#{locale}' #{direction}, projects.created_at ASC, projects.id ASC")
    )
  end

  # FILTERING METHODS
  def self.filter_status(scope, params = {})
    status = params[:status] || []
    return scope if status.blank?

    scope
      .joins("INNER JOIN admin_publications ON admin_publications.publication_id = projects.id AND admin_publications.publication_type = 'Project'")
      .where(admin_publications: { publication_status: status })
  end

  def self.filter_by_folder_ids(scope, params = {})
    folder_ids = params[:folder_ids] || []
    return scope if folder_ids.blank?

    scope
      .joins(
        'INNER JOIN admin_publications ON ' \
        'admin_publications.publication_id = projects.id ' \
        "AND admin_publications.publication_type = 'Project'"
      )
      .joins(
        'INNER JOIN admin_publications AS parent_admin_publications ON ' \
        'admin_publications.parent_id = parent_admin_publications.id'
      )
      .where(
        parent_admin_publications: {
          publication_id:   folder_ids,
          publication_type: 'ProjectFolders::Folder'
        }
      )
  end

  def self.filter_project_manager(scope, params = {})
    manager_ids = params[:managers] || []
    return scope if manager_ids.blank?

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
  end

  def self.search(scope, params = {})
    search = params[:search] || ''
    return scope if search.blank?

    scope.search_by_title(search)
  end

  def self.filter_start_date(scope, params = {})
    raw_min_start_date = params[:min_start_date]
    raw_max_start_date = params[:max_start_date]
    return scope if raw_min_start_date.blank? && raw_max_start_date.blank?

    min_start_date = parse_date(raw_min_start_date) || Date.new(1970, 1, 1)
    max_start_date = parse_date(raw_max_start_date) || Date.new(2100, 1, 1)

    overlapping_project_ids = Phase
      .group(:project_id)
      .having('min(start_at) >= ? AND min(start_at) <= ?', min_start_date, max_start_date)
      .select(:project_id)

    scope.where(id: overlapping_project_ids)
  end

  def self.filter_participation_states(scope, params = {})
    participation_states = params[:participation_states] || []
    return scope if participation_states.blank?

    today = Time.zone.today
    conditions = []

    if participation_states.include?('not_started')
      # Projects with no phases that have started yet
      conditions << "projects.id NOT IN (SELECT project_id FROM phases WHERE start_at < '#{today}')"
    end

    if participation_states.include?('collecting_data')
      # Projects with a current phase that is not 'information'
      conditions << <<-SQL.squish
        projects.id IN (
          SELECT project_id FROM phases
          WHERE (start_at, coalesce(end_at, 'infinity'::DATE)) OVERLAPS ('#{today}', '#{today}')
          AND participation_method != 'information'
        )
      SQL
    end

    if participation_states.include?('informing')
      # Projects with a current phase that is 'information'
      conditions << <<-SQL.squish
        projects.id IN (
          SELECT project_id FROM phases
          WHERE (start_at, coalesce(end_at, 'infinity'::DATE)) OVERLAPS ('#{today}', '#{today}')
          AND participation_method = 'information'
        )
      SQL
    end

    if participation_states.include?('past')
      # Projects with no phases that end in the future
      conditions << "projects.id NOT IN (SELECT project_id FROM phases WHERE coalesce(end_at, 'infinity'::DATE) >= '#{today}')"
    end

    scope.where(conditions.map { |c| "(#{c})" }.join(' OR '))
  end

  # Filter projects by the participation method of their current phase
  def self.filter_current_phase_participation_method(scope, params = {})
    participation_methods = params[:participation_methods] || []
    return scope if participation_methods.blank?

    current_phases_with_participation_methods = Phase
      .where(participation_method: participation_methods)
      .where("start_at <= current_date AND coalesce(end_at, 'infinity'::DATE) >= current_date")

    project_ids_with_matching_phase = current_phases_with_participation_methods
      .select(:project_id)

    scope.where(id: project_ids_with_matching_phase)
  end

  def self.parse_date(date_input)
    return date_input if date_input.is_a?(Date) || date_input.is_a?(Time)

    return nil if date_input.blank?

    begin
      Date.parse(date_input)
    rescue ArgumentError
      nil
    end
  end

  # Filter projects by visibility (access rights)
  def self.filter_visibility(scope, params = {})
    visibility_params = Array(params[:visibility])
    return scope if visibility_params.blank?

    valid_visibilities = %w[public groups admins]
    selected_visibilities = visibility_params & valid_visibilities

    return scope if selected_visibilities.blank?

    scope.where(visible_to: selected_visibilities)
  end

  # Filter projects by discoverability (listed/unlisted status)
  def self.filter_discoverability(scope, params = {})
    discoverability_params = Array(params[:discoverability])
    return scope if discoverability_params.blank?

    valid_discoverabilities = %w[listed unlisted]
    selected_discoverabilities = discoverability_params & valid_discoverabilities

    return scope if selected_discoverabilities.blank?

    conditions = []

    if selected_discoverabilities.include?('listed')
      conditions << scope.klass.where(listed: true)
    end

    if selected_discoverabilities.include?('unlisted')
      conditions << scope.klass.where(listed: false)
    end

    return scope if conditions.empty?

    scope.merge(conditions.reduce(:or))
  end
end
