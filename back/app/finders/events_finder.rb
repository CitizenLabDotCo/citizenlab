# frozen_string_literal: false

class EventsFinder < ApplicationFinder
  default_sort '-start_at'
  sortable_attributes 'start_at'

  private

  def project_ids_condition(project_ids)
    where(project_id: project_ids)
  end

  def project_publication_statuses_condition(project_publication_statuses)
    scope(:with_project_publication_statuses, project_publication_statuses) if project_publication_statuses.present?
  end

  def end_at_lt_condition(end_at)
    where('end_at < ?', end_at)
  end

  def end_at_gteq_condition(end_at)
    where('end_at >= ?', end_at)
  end
end
