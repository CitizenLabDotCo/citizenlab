class IdeasFilteringService

  def apply_common_index_filters ideas, params
    ideas = ideas.with_some_topics(params[:topics]) if params[:topics].present?
    ideas = ideas.with_some_areas(params[:areas]) if params[:areas].present?
    ideas = ideas.in_phase(params[:phase]) if params[:phase].present?
    ideas = ideas.where(project_id: params[:project]) if params[:project].present?
    ideas = ideas.where(author_id: params[:author]) if params[:author].present?
    ideas = ideas.where(assignee_id: params[:assignee]) if params[:assignee].present?
    ideas = ideas.where(idea_status_id: params[:idea_status]) if params[:idea_status].present?
    ideas = ideas.search_by_all(params[:search]) if params[:search].present?
    ideas = ideas.with_project_publication_status(params[:project_publication_status]) if params[:project_publication_status].present?
    ideas = ideas.feedback_needed if params[:feedback_needed].present?

    if params[:publication_status].present?
      ideas = ideas.where(publication_status: params[:publication_status])
    else
      ideas = ideas.where(publication_status: 'published')
    end

    if params[:filter_trending].present? && !params[:search].present?
      ideas = TrendingIdeaService.new.filter_trending ideas
    end

    ideas
  end

end