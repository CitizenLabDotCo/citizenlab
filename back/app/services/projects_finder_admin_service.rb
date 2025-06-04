class ProjectsFinderAdminService
  def initialize(projects, user = nil, params = {})
    @projects = projects
    @user = user
    @start_at = params[:start_at]
    @end_at = params[:end_at]
  end

  def recently_updated
    scope = apply_date_filter(@projects)

    # TODO sort by recently updated

    scope
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