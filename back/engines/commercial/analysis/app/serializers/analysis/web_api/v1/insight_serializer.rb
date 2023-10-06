# frozen_string_literal: true

module Analysis
  module WebApi
    module V1
      class InsightSerializer < ::WebApi::V1::BaseSerializer
        # No attributes, they're all on the insightable
        belongs_to :insightable, polymorphic: true
      end
    end
  end
end
