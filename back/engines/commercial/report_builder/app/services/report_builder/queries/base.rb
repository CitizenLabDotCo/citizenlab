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
    # TODO: try to move `compact.presence` to Analytics::Query
    {
      "#{dimension}.date" => { from: start_at, to: end_at }.compact.presence
    }.compact
  end

  def project_filter(dimension, project_id)
    # TODO: use dimension_project_id
    { "#{dimension}.id" => project_id }.compact
  end

  def interval(resolution)
    RESOLUTION_TO_INTERVAL[resolution]
  end
end
