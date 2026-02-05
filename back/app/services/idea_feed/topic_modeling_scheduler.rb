module IdeaFeed
  # Contains the logic to decide whether we should schedule topic modeling jobs
  # General logic:
  # - It will never run until the conversation has increased by at least 10%
  #   more inputs compared to the previous run
  # - It will always run immediately once the conversation exceeds 30% more
  #   inputs compared to the previous run
  # - It will run every 24 hours (during the night) in case the conversation has
  #   grown between 10% and 30%.
  class TopicModelingScheduler
    MINIMUM_INPUT_INCREASE = 0.1 # 10%
    INSTANT_INPUT_INCREASE = 0.3 # 30%
    DAILY_SCHEDULE_HOUR = 4 # 4 AM
    MINIMUM_INPUTS = 10
    MINIMUM_INTERVAL_BETWEEN_RUNS = 20.minutes

    attr_reader :phase

    def initialize(phase)
      @phase = phase
    end

    def on_every_hour
      return nil unless shared_conditions_for_scheduling_met?

      return nil unless Time.current.in_time_zone(AppConfiguration.timezone).hour == DAILY_SCHEDULE_HOUR
      return nil if input_increase_since_last_run < MINIMUM_INPUT_INCREASE

      schedule_job!
    end

    def on_new_input
      return nil unless shared_conditions_for_scheduling_met?

      return nil if input_increase_since_last_run < INSTANT_INPUT_INCREASE

      schedule_job!
    end

    private

    def shared_conditions_for_scheduling_met?
      return false if phase.ideas.published.count < MINIMUM_INPUTS
      return false if time_since_last_run < MINIMUM_INTERVAL_BETWEEN_RUNS

      true
    end

    def last_run_activity
      @last_run_activity ||= Activity.where(
        item: phase,
        action: 'topics_rebalanced'
      ).order(acted_at: :desc).first
    end

    def input_increase_since_last_run
      return Float::INFINITY unless last_run_activity

      inputs_at_last_run = last_run_activity.payload['input_count']
      return Float::INFINITY if inputs_at_last_run == 0

      inputs_now = phase.ideas.published.count

      (inputs_now - inputs_at_last_run) / inputs_at_last_run.to_f
    end

    def time_since_last_run
      return Float::INFINITY unless last_run_activity

      Time.current - last_run_activity.acted_at
    end

    def schedule_job!
      TopicModelingJob.perform_later(phase)
    end
  end
end
