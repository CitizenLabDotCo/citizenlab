# frozen_string_literal: true

class EventsFinder < ApplicationFinder
  private

  def static_page_id_condition(static_page_id)
    where(project_id: StaticPage.find(static_page_id).filter_projects(Project.all))
  end

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

  def attendee_id_condition(attendee_id)
    records.joins(:attendances).where(attendances: { attendee_id: attendee_id })
  end

  # Returns only the events that overlap with the given datetime range.
  def ongoing_during_condition(datetime_range)
    start_dt, end_dt = datetime_range
    start_dt ||= '-infinity'
    end_dt ||= 'infinity'

    records.where(<<~SQL.squish, start_datetime: start_dt, end_datetime: end_dt)
      (start_at, end_at) OVERLAPS (:start_datetime, :end_datetime)
    SQL
  end
end
