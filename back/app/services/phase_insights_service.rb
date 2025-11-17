class PhaseInsightsService
  include Singleton

  def insights_data(phase)
    cached_insights_data(phase)
  end

  private

  def initialize
    @insights_data = {}

    @cache_timestamps = {}
    @cache_ttl = 1.minute
  end

  def cached_insights_data(phase)
    cache_key = "phase_insights_#{phase.id}"

    # Expire old cache
    if @cache_timestamps[cache_key] && @cache_timestamps[cache_key] < @cache_ttl.ago
      @insights_data.delete(cache_key)
    end

    @insights_data[cache_key] ||= begin
      @cache_timestamps[cache_key] = Time.current

      visits_data = VisitsService.new.phase_visits_data(phase)

      visits_data
    end
  end
end