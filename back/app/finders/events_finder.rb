# frozen_string_literal: true

class EventsFinder < ApplicationFinder
  default_sort :start_at
  sortable_attributes 'start_at'

  private

  def project_ids_condition(project_ids)
    where(project_id: project_ids)
  end

  def project_publication_statuses_condition(project_publication_statuses)
    scope(:with_project_publication_statuses, project_publication_statuses) if project_publication_statuses.present?
  end

  def ends_before_date_condition(date)
    where('end_at < ?', date)
  end

  def ends_on_or_after_date_condition(date)
    where('end_at >= ?', date)
  end
end
