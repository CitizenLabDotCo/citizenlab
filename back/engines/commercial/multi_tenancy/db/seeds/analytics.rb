# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class Analytics < Base
      def run
        ::Analytics::PopulateDimensionsService.run
      end
    end
  end
end
