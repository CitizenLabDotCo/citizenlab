class ProjectsFinderAdminService
  UUID_REGEX = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'

  # EXECUTION
  def self.execute(scope, params = {}, current_user: nil)
    projects = scope

    # Apply filters
    projects = filter_with_admin_publication(projects)
    projects = filter_moderatable(projects, current_user)
    projects = filter_status(projects, params)
    projects = filter_display_status(projects, params)
    projects = filter_review_state(projects, params)
    projects = filter_by_folder_ids(projects, params)
    projects = filter_project_manager(projects, params)
    projects = filter_excluded_project_ids(projects, params)
    projects = filter_excluded_folder_ids(projects, params)
    projects = search(projects, params)
    projects = filter_start_date(projects, params)
    projects = filter_phase_date_range(projects, params)
    projects = filter_participation_states(projects, params)
    projects = filter_participation_methods(projects, params)
    projects = filter_visibility(projects, params)
    projects = filter_discoverability(projects, params)
    projects = filter_space(projects, params)
    projects = filter_top_level(projects, params, current_user)

    # Apply sorting
    case params[:sort]
    when 'recently_viewed'
      sort_recently_viewed(projects, current_user)
    when 'arranged'
      sort_arranged(projects, current_user)
    when *SORT_VALUES.keys.flat_map { |key| ["#{key}_asc", "#{key}_desc"] }
      sort_by_value(projects, params[:sort])
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

  # The phase that represents the project right now, as in
  # ProjectSchedule#highlighted_phase: the active phase that ends soonest,
  # otherwise the upcoming phase that starts soonest, otherwise the phase that
  # ended last. `highlighted.state` is 'active', 'upcoming' or 'ended'.
  HIGHLIGHTED_PHASE_SQL = <<~SQL.squish
    SELECT %<column>s FROM (
      SELECT phases.*, CASE
        WHEN phases.start_at <= now() AND (phases.end_at IS NULL OR now() < phases.end_at) THEN 'active'
        WHEN phases.start_at > now() THEN 'upcoming'
        ELSE 'ended'
      END AS state
      FROM phases WHERE phases.project_id = projects.id
    ) highlighted
    ORDER BY
      array_position(ARRAY['active', 'upcoming', 'ended'], highlighted.state),
      CASE WHEN highlighted.state = 'active' THEN highlighted.end_at END ASC NULLS LAST,
      CASE WHEN highlighted.state = 'upcoming' THEN highlighted.start_at END ASC,
      highlighted.end_at DESC
    LIMIT 1
  SQL

  # SQL for the value each sortable column of the admin project list orders
  # by. Projects without a value come last in both directions.
  SORT_VALUES = {
    # Published, pending approval, draft, archived: the order the list shows
    # statuses in. Scheduled statuses count once they are due, as in
    # AdminPublication#effective_publication_status.
    'status' => <<~SQL.squish,
      SELECT CASE
        WHEN status.value = 'published' THEN 0
        WHEN status.value = 'draft' AND EXISTS (
          SELECT 1 FROM project_reviews
          WHERE project_reviews.project_id = projects.id AND project_reviews.approved_at IS NULL
        ) THEN 1
        WHEN status.value = 'draft' THEN 2
        ELSE 3
      END
      FROM (
        SELECT CASE
          WHEN publications.scheduled_at <= now() AND publications.scheduled_status IS NOT NULL
            THEN publications.scheduled_status
          ELSE publications.publication_status
        END AS value
        FROM admin_publications publications
        WHERE publications.publication_type = 'Project' AND publications.publication_id = projects.id
      ) status
    SQL
    # Open, starting soon, no phases yet, ended.
    'phase' => <<~SQL.squish,
      SELECT array_position(
        ARRAY['active', 'upcoming', 'none', 'ended'],
        COALESCE((#{format(HIGHLIGHTED_PHASE_SQL, column: 'highlighted.state')}), 'none')
      )
    SQL
    'participation_method' => format(HIGHLIGHTED_PHASE_SQL, column: 'highlighted.participation_method'),
    'managers' => <<~SQL.squish,
      SELECT min(NULLIF(lower(concat_ws(' ', users.first_name, users.last_name)), ''))
      FROM users
      WHERE users.roles @> jsonb_build_array(
        jsonb_build_object('type', 'project_moderator', 'project_id', projects.id::text)
      )
    SQL
    'start_date' => 'SELECT min(phases.start_at) FROM phases WHERE phases.project_id = projects.id',
    # A project with an open-ended phase has no end date.
    'end_date' => <<~SQL.squish
      SELECT CASE WHEN bool_and(phases.end_at IS NOT NULL) THEN max(phases.end_at) END
      FROM phases WHERE phases.project_id = projects.id
    SQL
  }.freeze

  # The methods below are private class methods.
  # They are currently only used by the execute method,
  # but could be used in other places as well.

  # SORTING METHODS
  def self.sort_recently_viewed(scope, current_user)
    # We order by last_viewed_at, but tie-break with created_at and id for a stable sort,
    # which is important for pagination
    Project
      .from(with_last_viewed_at(scope, current_user), :projects)
      .order('last_viewed_at DESC NULLS LAST, projects.created_at ASC, projects.id ASC')
  end

  # The order admins arranged projects in for the front office. Positions are
  # numbered per parent (a folder or the top level), so projects with
  # different parents can share one; the user's last viewed comes first then.
  def self.sort_arranged(scope, current_user)
    projects_subquery = with_last_viewed_at(scope, current_user).select(<<~SQL.squish)
      (
        SELECT arranged.ordering FROM admin_publications arranged
        WHERE arranged.publication_type = 'Project' AND arranged.publication_id = projects.id
      ) AS arranged_ordering
    SQL

    Project
      .from(projects_subquery, :projects)
      .order('arranged_ordering ASC NULLS LAST, last_viewed_at DESC NULLS LAST, projects.created_at ASC, projects.id ASC')
  end

  def self.sort_by_value(scope, sort)
    key, _, direction = sort.rpartition('_')
    projects_subquery = scope.select("projects.*, (#{SORT_VALUES.fetch(key)}) AS sort_value")

    Project
      .from(projects_subquery, :projects)
      .order(Arel.sql("sort_value #{direction == 'desc' ? 'DESC' : 'ASC'} NULLS LAST, projects.created_at ASC, projects.id ASC"))
  end

  def self.with_last_viewed_at(scope, current_user)
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

    scope
      .joins("LEFT JOIN #{recent_pageviews_subquery} ON recent_pageviews.admin_project_id = projects.id AND recent_pageviews.rn = 1")
      .select('recent_pageviews.last_viewed_at AS last_viewed_at, projects.*')
  end

  def self.sort_phase_starting_or_ending_soon(scope)
    now = Time.zone.now

    phases_ending_soon = Phase
      .where("coalesce(end_at, 'infinity'::timestamptz) >= ?", now)
      .group(:project_id)
      .select("project_id, min(coalesce(end_at, 'infinity'::timestamptz)) AS min_end_at")

    phases_starting_soon = Phase
      .where(start_at: now..)
      .group(:project_id)
      .select('project_id, min(start_at) AS min_start_at')

    projects_subquery = scope
      .with(phases_ending_soon:, phases_starting_soon:)
      .joins('LEFT JOIN phases_ending_soon ON phases_ending_soon.project_id = projects.id')
      .joins('LEFT JOIN phases_starting_soon ON phases_starting_soon.project_id = projects.id')
      .select('projects.*, least(phases_ending_soon.min_end_at, phases_starting_soon.min_start_at) AS soon_date')

    # We order by soon_date, but tie-break with created_at and id for a stable sort,
    # which is important for pagination
    Project
      .from(projects_subquery, :projects)
      .order('soon_date ASC NULLS LAST, projects.created_at ASC, projects.id ASC')
  end

  def self.sort_alphabetically(scope, params)
    # Filter locale param against configured locales to prevent SQL injection
    configured_locales = AppConfiguration.instance.settings('core', 'locales')
    locale = configured_locales.include?(params[:locale]) ? params[:locale] : 'en'
    direction = params[:sort] == 'alphabetically_desc' ? 'DESC' : 'ASC'
    # quote method is used to prevent SQL injection
    quoted_locale = scope.connection.quote(locale)

    scope.order(
      Arel.sql("projects.title_multiloc->>#{quoted_locale} #{direction}, projects.created_at ASC, projects.id ASC")
    )
  end

  def self.sort_by_participation(scope, params)
    direction = params[:sort] == 'participation_desc' ? :desc : :asc
    scope.by_participation_count(direction)
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
    statuses = params[:status] || []
    return scope if statuses.blank?

    scope.where(admin_publication: AdminPublication.with_status(statuses))
  end

  # The status as the admin project list shows it: a draft waiting for review
  # approval is 'pending' rather than 'draft'. Unlike combining `status` with
  # `review_state`, the selected statuses add up.
  def self.filter_display_status(scope, params = {})
    statuses = Array(params[:display_status]) & %w[published pending draft archived]
    return scope if statuses.blank?

    project_publications = AdminPublication.where(publication_type: 'Project')
    drafts = project_publications.with_status('draft').select(:publication_id)
    awaiting_approval = ProjectReview.where(approved_at: nil).select(:project_id)

    matching_ids = []
    other_statuses = statuses & %w[published archived]
    matching_ids << project_publications.with_status(other_statuses).select(:publication_id) if other_statuses.any?
    matching_ids << Project.where(id: drafts).where(id: awaiting_approval).select(:id) if statuses.include?('pending')
    matching_ids << Project.where(id: drafts).where.not(id: awaiting_approval).select(:id) if statuses.include?('draft')

    matching_ids.map { |ids| scope.where(id: ids) }.reduce(:or)
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

    scope.where(admin_publication: { parent_id: [nil] }).or(
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
      .where("(start_at, coalesce(end_at, 'infinity'::timestamp)) OVERLAPS (?::timestamp, ?::timestamp)", start_date, end_date)

    scope.where(id: overlapping_project_ids)
  end

  def self.filter_participation_states(scope, params = {})
    participation_states = params[:participation_states] || []
    return scope if participation_states.blank?

    conditions = []

    if participation_states.include?('not_started')
      # Projects with no phases that have started yet
      conditions << 'projects.id NOT IN (SELECT project_id FROM phases WHERE start_at < now())'
    end

    if participation_states.include?('collecting_data')
      # Projects with a current phase that is not 'information'
      conditions << <<-SQL.squish
        projects.id IN (
          SELECT project_id FROM phases
          WHERE start_at <= now() AND coalesce(end_at, 'infinity'::timestamp) > now()
          AND participation_method != 'information'
        )
      SQL
    end

    if participation_states.include?('informing')
      # Projects with a current phase that is 'information'
      conditions << <<-SQL.squish
        projects.id IN (
          SELECT project_id FROM phases
          WHERE start_at <= now() AND coalesce(end_at, 'infinity'::timestamp) > now()
          AND participation_method = 'information'
        )
      SQL
    end

    if participation_states.include?('starting_soon')
      # Projects with no current phase and a phase still to come, as in
      # ProjectSchedule#participation_status
      conditions << <<-SQL.squish
        projects.id IN (SELECT project_id FROM phases WHERE start_at > now())
        AND projects.id NOT IN (
          SELECT project_id FROM phases
          WHERE start_at <= now() AND coalesce(end_at, 'infinity'::timestamp) > now()
        )
      SQL
    end

    if participation_states.include?('no_phases')
      conditions << 'projects.id NOT IN (SELECT project_id FROM phases)'
    end

    if participation_states.include?('past')
      # Projects that have at least one phase and all phases have ended
      conditions << <<-SQL.squish
        projects.id IN (
          SELECT project_id FROM phases
          GROUP BY project_id
          HAVING COUNT(*) > 0
          AND MAX(coalesce(end_at, 'infinity'::timestamp)) <= now()
        )
      SQL
    end

    scope.where(conditions.map { |c| "(#{c})" }.join(' OR '))
  end

  # Filter projects that have at least one phase with one of the given participation methods
  def self.filter_participation_methods(scope, params = {})
    participation_methods = params[:participation_methods] || []
    return scope if participation_methods.blank?

    project_ids_with_matching_phase = Phase
      .where(participation_method: participation_methods)
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

  # Filter projects by space
  def self.filter_space(scope, params = {})
    space_ids = params[:space_ids]
    return scope if space_ids.blank?

    scope.where(space_id: space_ids)
  end

  # Keeps the projects that sit directly at the level of the admin project
  # hierarchy being viewed: not inside a folder the user can open, nor inside
  # a space the user can open, unless that space is the level being viewed
  # (`space_ids`). Projects a user can't reach through a container stay, so
  # nothing they manage disappears.
  def self.filter_top_level(scope, params, current_user)
    return scope unless params[:top_level].to_s == 'true'
    return scope.none unless current_user

    folder_publication_ids = AdminPublication
      .where(publication_type: 'ProjectFolders::Folder', publication_id: AdminHierarchyScope.folders(current_user).select(:id))
      .select(:id)
    scope = scope.where(admin_publication: { parent_id: nil })
      .or(scope.where.not(admin_publication: { parent_id: folder_publication_ids }))

    space_ids = AdminHierarchyScope.spaces(current_user).where.not(id: Array(params[:space_ids])).select(:id)
    scope.where(space_id: nil).or(scope.where.not(space_id: space_ids))
  end
end
