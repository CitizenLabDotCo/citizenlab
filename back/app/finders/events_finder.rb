# frozen_string_literal: true

## EventsFinder.find
class EventsFinder < ApplicationFinder
  default_sort :start_at
  sortable_attributes 'start_at'

  private

  def project_ids_condition(project_ids)
    where(project_id: project_ids)
  end

  def start_at_lt_condition(start_at)
    where('start_at < ?', start_at)
  end

  def start_at_gteq_condition(start_at)
    where('start_at >= ?', start_at)
  end
end
