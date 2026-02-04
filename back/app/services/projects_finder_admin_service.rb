class ProjectsFinderAdminService
  UUID_REGEX = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'

  # EXECUTION
  def self.execute(scope, params = {}, current_user: nil)
    projects = scope

    # Apply filters
    projects = filter_with_admin_publication(projects)
    projects = filter_moderatable(projects, current_user)
    projects = filter_status(projects, params)
    projects = filter_review_state(projects, params)
    projects = filter_by_folder_ids(projects, params)
    projects = filter_project_manager(projects, params)
    projects = filter_excluded_project_ids(projects, params)
    projects = filter_excluded_folder_ids(projects, params)
    projects = search(projects, params)
    projects = filter_start_date(projects, params)
    projects = filter_phase_date_range(projects, params)
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
    when 'participation_asc', 'participation_desc'
      sort_by_participation(projects, params)
    else
      direction = params[:sort] == 'recently_created_desc' ? 'DESC' : 'ASC'
      projects.order("projects.created_at #{direction}, projects.id ASC")
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

  def self.sort_by_participation(scope, params)
    direction = params[:sort] == 'participation_desc' ? 'DESC' : 'ASC'

    scope
      .with_participation_count
      .order(Arel.sql("COALESCE(project_participants.participants_count, 0) #{direction}, projects.id ASC"))
  end

  # FILTERING METHODS
  def self.filter_with_admin_publication(scope)
    # Filter out projects that don't have an admin_publication to prevent crashes
    # when trying to access publication_status or other admin_publication attributes
    scope.joins(:admin_publication)
  end

  def self.filter_moderatable(scope, current_user)
    return scope.none unless current_user
    return scope if current_user.admin?

    moderatable_project_ids = current_user.moderatable_project_ids
    moderated_folder_admin_publication_ids = AdminPublication.where(
      publication_id: current_user.moderated_project_folder_ids,
      publication_type: 'ProjectFolders::Folder'
    ).pluck(:id)

    scope
      .joins(
        'INNER JOIN admin_publications ON admin_publications.publication_id = projects.id ' \
        "AND admin_publications.publication_type = 'Project'"
      )
      .where(
        'projects.id IN (:project_ids) OR admin_publications.parent_id IN (:folder_admin_pub_ids)',
        project_ids: moderatable_project_ids,
        folder_admin_pub_ids: moderated_folder_admin_publication_ids
      )
  end

  def self.filter_status(scope, params = {})
    status = params[:status] || []
    return scope if status.blank?

    scope
      .joins("INNER JOIN admin_publications ON admin_publications.publication_id = projects.id AND admin_publications.publication_type = 'Project'")
      .where(admin_publications: { publication_status: status })
  end

  def self.filter_review_state(scope, params = {})
    review_state = params[:review_state] || []
    return scope if review_state.blank?

    scope = scope.joins(:review)

    case review_state
    when 'pending'
      filter_status(
        scope.where(project_reviews: { approved_at: nil }),
        { status: ['draft'] }
      )
    when 'approved'
      scope.where.not(project_reviews: { approved_at: nil })
    else
      scope
    end
  end

  # Filter projects by folder IDs
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

  # Excludes projects by their project IDs
  def self.filter_excluded_project_ids(scope, params = {})
    excluded_project_ids = params[:excluded_project_ids] || []
    return scope if excluded_project_ids.blank?

    scope.where.not(id: excluded_project_ids)
  end

  # NOTE: This method requires admin_publications to be joined to the scope.
  # Excludes projects whose parent folder is in the excluded folders list.
  # When a folder is excluded, all projects within that folder are automatically excluded.
  def self.filter_excluded_folder_ids(scope, params = {})
    excluded_folder_ids = params[:excluded_folder_ids] || []
    return scope if excluded_folder_ids.blank?

    excluded_folder_admin_pub_ids = AdminPublication
      .where(publication_type: 'ProjectFolders::Folder', publication_id: excluded_folder_ids)
      .select(:id)

    scope.where(
      admin_publication: { parent_id: [nil] }
    ).or(
      scope.where.not(admin_publication: { parent_id: excluded_folder_admin_pub_ids })
    )
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

  # Filter projects by a date range where ANY phase overlaps with the given range.
  # This is different from filter_start_date which filters by when the first phase started.
  # Used primarily for report building to find projects active during a time period.
  def self.filter_phase_date_range(scope, params = {})
    phase_start_date = params[:phase_start_date]
    phase_end_date = params[:phase_end_date]
    return scope if phase_start_date.blank? || phase_end_date.blank?

    start_date = parse_date(phase_start_date)
    end_date = parse_date(phase_end_date)
    return scope if start_date.blank? || end_date.blank?

    overlapping_project_ids = Phase
      .select(:project_id)
      .where("(start_at, coalesce(end_at, 'infinity'::DATE)) OVERLAPS (?, ?)", start_date, end_date)

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
      # Projects that have at least one phase and all phases have ended
      conditions << <<-SQL.squish
        projects.id IN (
          SELECT project_id FROM phases 
          GROUP BY project_id 
          HAVING COUNT(*) > 0 
          AND MAX(coalesce(end_at, 'infinity'::DATE)) < '#{today}'
        )
      SQL
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

    valid_visibilities = %w[public groups admins]
    selected_visibilities = visibility_params & valid_visibilities

    return scope if selected_visibilities.blank?

    scope.where(visible_to: selected_visibilities)
  end

  # Filter projects by discoverability (listed/unlisted status)
  def self.filter_discoverability(scope, params = {})
    discoverability_params = Array(params[:discoverability])

    valid_discoverabilities = %w[listed unlisted]
    selected_discoverabilities = discoverability_params & valid_discoverabilities

    return scope if selected_discoverabilities.blank? || selected_discoverabilities.length == 2

    if selected_discoverabilities.include?('listed')
      scope.where(listed: true)
    else
      scope.where(listed: false)
    end
  end
end
