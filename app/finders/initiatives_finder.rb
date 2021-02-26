class InitiativesFinder < ApplicationFinder
  default_sort 'new'

  # rubocop:disable Layout/HashAlignment
  sort_scopes(
    'new'           => { order_new: :desc },
    '-new'          => { order_new: :asc },
    'status'        => { order_status: :asc },
    '-status'       => { order_status: :desc },
    'random'        => :order_random,
    'author_name'   => ['users.first_name ASC', 'users.last_name ASC'],
    '-author_name'  => ['users.first_name DESC', 'users.last_name DESC']
  )
  # rubocop:enable Layout/HashAlignment

  sortable_attributes :upvotes_count

  private

  def topics_condition(topics)
    scope(:with_some_topics, topics)
  end

  def areas_condition(areas)
    scope(:with_some_areas, areas)
  end

  def initiative_status_condition(status_id)
    filter_records do
      records.left_outer_joins(:initiative_initiative_status)
             .where(initiative_initiative_statuses: { initiative_status_id: status_id })
    end
  end

  def assignee_condition(assignee_id)
    where(assignee_id: assignee_id)
  end

  def feedback_needed_condition(param)
    return unless param

    scope(:feedback_needed)
  end

  def author_condition(author_id)
    filter_records { records.includes(:author).where(author_id: author_id) }
  end

  def search_condition(search_term)
    if _search_restricted?
      scope(:restricted_search, search_term)
    else
      scope(:search_by_all, search_term)
    end
  end

  def publication_status_condition(status)
    where(publication_status: status)
  end

  def bounding_box_condition(bounding_box)
    scope(:with_bounding_box, bounding_box)
  end

  def initiatives_condition(initiative_ids)
    where(id: initiative_ids)
  end

  def _search_restricted?
    UserDisplayNameService.new(AppConfiguration.instance, @authorized_with).restricted?
  end
end
