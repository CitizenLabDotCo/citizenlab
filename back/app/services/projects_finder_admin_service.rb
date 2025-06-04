class ProjectsFinderAdminService
  def initialize(projects, user = nil, params = {})
    @projects = projects
    @user = user
    @params = params
    @start_at = params[:start_at]
    @end_at = params[:end_at]
  end

  def recently_updated
    scope = apply_date_filter(@projects)

    # TODO sort by recently updated

    scope
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