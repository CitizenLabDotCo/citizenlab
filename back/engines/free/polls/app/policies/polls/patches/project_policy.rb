module Polls
  module Patches
    module ProjectPolicy
      def responses_count?
        moderate?
      end
    end
  end
end
