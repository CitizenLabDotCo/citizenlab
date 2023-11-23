class ReportBuilder::Queries::Base
  RESOLUTION_TO_INTERVAL = {
    'month' => 'month',
    'week' => 'week',
    'day' => 'date'
  }.freeze

  def query(**_props)
    raise NotImplementedError
  end

  private

  def date_filter(dimension, start_at, end_at)
    return {} if start_at.blank? && end_at.blank?

    {
      "#{dimension}.date" => { from: start_at&.to_s, to: end_at&.to_s }.compact.presence
    }.compact
  end

  def project_filter(project_id_column, project_id)
    { project_id_column => project_id }.compact
  end

  def interval(resolution)
    RESOLUTION_TO_INTERVAL[resolution]
  end
end
