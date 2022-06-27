# frozen_string_literal: true

module MultiTenancy
  module Seeds
    # Base class for seeding classes that seed specific records.
    # The {#runner} has access to seeding helper methods, defaults and other config.
    # Child classes should overwrite the {#run} method, where the actual seeding takes place.
    class Base
      attr_reader :runner

      # @param runner [MultiTenancy::Seeds::Runner]
      def initialize(runner:)
        @runner = runner
      end

      def run; end
    end
  end
end
