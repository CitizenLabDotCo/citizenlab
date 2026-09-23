class ReportBuilder::Queries::Analytics::Base < ReportBuilder::Queries::Base
  RESOLUTION_TO_INTERVAL = {
    'month' => 'month',
    'week' => 'week',
    'day' => 'date'
  }.freeze

  def run_query(**props)
    json_query = query(**props)
    results, errors, _paginations = Analytics::MultipleQueries.new.run(json_query)
    if errors.present?
      raise "Error processing Analytics query: #{errors.to_json}"
    end

    results
  end

  protected

  def query(**_props)
    raise NotImplementedError
  end

  private

  def date_filter(dimension, start_at, end_at)
    return {} if start_at.blank? && end_at.blank?

    {
      "#{dimension}.date" => {
        from: start_at&.to_s.presence,
        to: end_at&.to_s.presence
      }.compact.presence
    }.compact
  end

  def project_filter(project_id_column, project_id)
    { project_id_column => project_id.presence }.compact
  end

  def interval(resolution)
    RESOLUTION_TO_INTERVAL.fetch(resolution || 'month')
  end

  # Keeps participations without a known user (e.g. anonymous ones), since we
  # cannot tell whether they were made by an admin or moderator.
  def exclude_admins_and_moderators_filter(exclude_admins_and_moderators)
    return {} unless exclude_admins_and_moderators

    { 'dimension_user.role': ['citizen', nil] }
  end

  def visitor_filter(apply)
    return {} unless apply

    { 'dimension_user.has_visits': 'true' }
  end
end
