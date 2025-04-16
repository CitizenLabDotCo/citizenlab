class ReportBuilder::Queries::Base
  def initialize(current_user)
    @current_user = current_user
  end

  def validate_resolution(resolution)
    valid_resolutions = %w[day week month]
    unless valid_resolutions.include?(resolution)
      raise ArgumentError, "Invalid resolution: #{resolution}. Must be one of: #{valid_resolutions.join(', ')}"
    end
  end
end
