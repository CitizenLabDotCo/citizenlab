# frozen_string_literal: true

class InitiativesFinder < ApplicationFinder
  def find_records
    initiatives = super
    # We use Initiative.where to avoid duplicates caused by `left_outer_joins(:cosponsors_initiatives)`.
    # #distinct fails with `ERROR:  for SELECT DISTINCT, ORDER BY expressions must appear in select list ... md5(`
    Initiative.where(id: initiatives).includes(@includes)
  end

  private

  def topics_condition(topics)
    scope(:with_some_topics, topics)
  end

  def areas_condition(areas)
    scope(:with_some_areas, areas)
  end

  def initiative_status_condition(status_id)
    records.left_outer_joins(:initiative_initiative_status)
      .where(initiative_initiative_statuses: { initiative_status_id: status_id })
  end

  def assignee_condition(assignee_id)
    assignee_id = nil if assignee_id == 'unassigned'
    where(assignee_id: assignee_id)
  end

  def feedback_needed_condition(feedback_needed)
    feedback_needed ? scope(:feedback_needed) : scope(:no_feedback_needed)
  end

  def author_condition(author_id)
    records.includes(:author).where(author_id: author_id)
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
    UserDisplayNameService.new(AppConfiguration.instance, current_user).restricted?
  end
end
