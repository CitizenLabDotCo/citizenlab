# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class CommonPasswords < Base
      def run
        CommonPassword.initialize!
      end
    end
  end
end
