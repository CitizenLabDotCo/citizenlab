# frozen_string_literal: true

module MultiTenancy
  module Seeds
    # Base class for seeding classes that seed specific records.
    # The {#runner} has access to seeding helper methods, defaults and other config.
    # Child classes should overwrite the {#run} method, where the actual seeding takes place.
    class Base
      # @param runner [MultiTenancy::Seeds::Runner]
      def initialize(runner:)
        @runner = runner
      end

      def run; end

      private

      attr_reader :runner
    end
  end
end
