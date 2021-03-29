module Clusterings
  class WebApi::V1::ClusteringSerializer < ::WebApi::V1::BaseSerializer
    attributes :title_multiloc, :structure, :created_at, :updated_at
  end
end
