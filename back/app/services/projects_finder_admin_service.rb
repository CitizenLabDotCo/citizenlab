class ProjectsFinderAdminService
  UUID_REGEX = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'

  def initialize(projects, params = {})
    @start_at = params[:start_at]
    @end_at = params[:end_at]
    @page_size = (params.dig(:page, :size) || 500).to_i
    @page_number = (params.dig(:page, :number) || 1).to_i
    @managers = params[:managers] || []

    projects_scope = apply_date_filter(projects)
    projects_scope = apply_manager_filter(projects_scope)

    @projects = projects_scope
  end

  def recently_viewed
    substring_statement = "substring(path, 'admin/projects/(#{UUID_REGEX})')"

    # I first did this with a group by and max, but Copilot suggested
    # using a window function instead, which is more efficient
    recent_pageviews_sql = <<-SQL.squish
      SELECT
        #{substring_statement}::UUID AS admin_project_id,
        created_at AS last_viewed_at,
        ROW_NUMBER() OVER (
          PARTITION BY #{substring_statement}
          ORDER BY created_at DESC
        ) AS rn
      FROM impact_tracking_pageviews
      WHERE path LIKE '%admin/projects/%'
    SQL

    recent_pageviews_subquery = "(#{recent_pageviews_sql}) AS recent_pageviews"

    projects_subquery = @projects
      .joins("LEFT JOIN #{recent_pageviews_subquery} ON recent_pageviews.admin_project_id = projects.id AND recent_pageviews.rn = 1")
      .select('recent_pageviews.last_viewed_at AS last_viewed_at, projects.*')

    # We order by last_viewed_at, but tie-break with created_at and id for a stable sort,
    # which is important for pagination
    Project
      .from(projects_subquery, :projects)
      .order('last_viewed_at DESC NULLS LAST, projects.created_at ASC, projects.id ASC')
      .limit(@page_size)
      .offset(@page_size * (@page_number - 1))
  end

  def phase_starting_or_ending_soon
    phases_ending_soon_subquery = Phase
      .where("coalesce(end_at, 'infinity'::DATE) >= current_date")
      .group(:project_id)
      .select("project_id, min(coalesce(end_at, 'infinity'::DATE)) AS min_end_at")

    phases_starting_soon_subquery = Phase
      .where('start_at >= current_date')
      .group(:project_id)
      .select('project_id, min(start_at) AS min_start_at')

    projects_subquery = @projects
      .joins("LEFT JOIN (#{phases_ending_soon_subquery.to_sql}) AS phases_ending_soon ON phases_ending_soon.project_id = projects.id")
      .joins("LEFT JOIN (#{phases_starting_soon_subquery.to_sql}) AS phases_starting_soon ON phases_starting_soon.project_id = projects.id") 
      .select('least(phases_ending_soon.min_end_at, phases_starting_soon.min_start_at) AS soon_date, projects.*')
    
    # We order by soon_date, but tie-break with created_at and id for a stable sort,
    # which is important for pagination
    Project
      .from(projects_subquery, :projects)
      .order('soon_date ASC NULLS LAST, projects.created_at ASC, projects.id ASC')
      .limit(@page_size)
      .offset(@page_size * (@page_number - 1))
  end

  # def apply_manager_filter(scope)
    # TODO
  # end

  private

  def apply_date_filter(scope)
    if @start_at.present? || @end_at.present?
      start_at = @start_at || Date.new(1970, 1, 1)
      end_at = @end_at || DateTime::Infinity

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