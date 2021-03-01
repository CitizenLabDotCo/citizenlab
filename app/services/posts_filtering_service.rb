class PostsFilteringService
  def apply_common_initiative_index_filters(initiatives, params, search_last_names=true)
    initiatives = apply_common_post_index_filters(initiatives, params, search_last_names)
    initiatives = initiatives.with_some_topics(params[:topics]) if params[:topics].present?
    initiatives = initiatives.with_some_areas(params[:areas]) if params[:areas].present?
    if params[:initiative_status].present?
      initiatives = initiatives
        .left_outer_joins(:initiative_initiative_status)
        .where('initiative_initiative_statuses.initiative_status_id = ?', params[:initiative_status])
    end
    initiatives = initiatives.where(assignee_id: params[:assignee]) if params[:assignee].present?
    initiatives = initiatives.feedback_needed if params[:feedback_needed].present?

    initiatives
  end

  private

  def apply_common_post_index_filters(posts, params, search_last_names=true)
    posts = posts.includes(:author).where(author_id: params[:author]) if params[:author].present?

    if params[:search].present?
      posts = search_last_names ? posts.search_by_all(params[:search]) : posts.restricted_search(params[:search])
    end

    if params[:publication_status].present?
      posts = posts.where(publication_status: params[:publication_status])
    else
      posts = posts.where(publication_status: 'published')
    end

    posts
  end
end
