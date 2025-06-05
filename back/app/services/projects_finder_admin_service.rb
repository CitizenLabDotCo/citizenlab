class ProjectsFinderAdminService
  def initialize(projects, params = {})
    @projects = projects
    @start_at = params[:start_at]
    @end_at = params[:end_at]
  end

  def recently_viewed
    scope = apply_date_filter(@projects)

    recent_pageviews_subquery = ImpactTracking::Pageview
      .group(:project_id)
      .select('project_id, max(created_at) AS last_viewed_at')

    projects_subquery = scope
      .joins("LEFT JOIN (#{recent_pageviews_subquery.to_sql}) AS recent_pageviews ON recent_pageviews.project_id = projects.id")
      .select('recent_pageviews.last_viewed_at AS last_viewed_at, projects.*')

    Project
      .from(projects_subquery, :projects)
      .order('last_viewed_at DESC NULLS LAST')
  end

  def phase_starting_or_ending_soon
    scope = apply_date_filter(@projects)

    phases_ending_soon_subquery = Phase
      .where('end_at >= current_date')
      .group(:project_id)
      .select('project_id, min(end_at) AS min_end_at')

    phases_starting_soon_subquery = Phase
      .where('start_at >= current_date')
      .group(:project_id)
      .select('project_id, min(start_at) AS min_start_at')

    projects_subquery = scope
      .joins("LEFT JOIN (#{phases_ending_soon_subquery.to_sql}) AS phases_ending_soon ON phases_ending_soon.project_id = projects.id")
      .joins("LEFT JOIN (#{phases_starting_soon_subquery.to_sql}) AS phases_starting_soon ON phases_starting_soon.project_id = projects.id") 
      .select('least(phases_ending_soon.min_end_at, phases_starting_soon.min_start_at) AS soon_date, projects.*')
    
    Project
      .from(projects_subquery, :projects)
      .order('soon_date ASC NULLS LAST')
  end

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