class ReportBuilder::Queries::Base
  RESOLUTION_TO_INTERVAL = {
    'month' => 'month',
    'week' => 'week',
    'day' => 'date'
  }.freeze

  def initialize(current_user)
    @current_user = current_user
  end

  def interval(resolution)
    RESOLUTION_TO_INTERVAL.fetch(resolution || 'month')
  end
end
