# frozen_string_literal: true

module Analysis
  class SideFxInsightService
    include SideFxHelper
    def after_rate(insight, user, rating)
      LogActivityJob.perform_later(insight, 'rated', user, Time.now.to_i, payload: { rating: rating })
    end
  end
end
