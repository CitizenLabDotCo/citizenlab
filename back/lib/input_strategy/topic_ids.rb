# frozen_string_literal: true

module InputStrategy
  class TopicIds < Base
    def supports_select_count?
      true
    end
  end
end
