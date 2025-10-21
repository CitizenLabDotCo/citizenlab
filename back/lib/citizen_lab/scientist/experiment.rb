# frozen_string_literal: true

require 'scientist/experiment'

module CitizenLab
  module Scientist
    class Experiment
      include ::Scientist::Experiment

      attr_accessor :name

      def initialize(name)
        @name = name
      end

      def enabled?
        Utils.to_bool(ENV.fetch("SCIENTIST_EXPERIMENT_#{name.upcase}_ENABLED", false))
      end

      def raised(_operation, error)
        ErrorReporter.report(error)
      end

      def publish(result)
        if result.mismatched?
          ErrorReporter.report_msg("Experiment '#{name}' mismatched",
            extra: {
              name: name,
              context: result.context,
              control: observation_payload(result.control),
              candidate: observation_payload(result.candidates.first),
              execution_order: result.observations.map(&:name)
            })
        else
          Rails.logger.info("Experiment '#{name}' matched")
        end
      end

      def observation_payload(observation)
        if observation.raised?
          {
            exception: observation.exception.class,
            message: observation.exception.message,
            backtrace: observation.exception.backtrace
          }
        else
          {
            value: observation.cleaned_value
          }
        end
      end
    end
  end
end
