module Tagging
  class WebApi::V1::PendingTaskSerializer < ::WebApi::V1::BaseSerializer
    has_many :ideas
    has_many :tags
  end
end
