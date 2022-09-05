# frozen_string_literal: true

module Insights
  module WebApi
    module V1
      class NetworkSerializer < ::WebApi::V1::BaseSerializer
        attributes :nodes, :links
      end
    end
  end
end
