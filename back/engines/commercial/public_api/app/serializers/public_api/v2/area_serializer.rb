# frozen_string_literal: true

class PublicApi::V2::AreaSerializer < PublicApi::V2::BaseSerializer
  attributes :id, :created_at, :updated_at
  multiloc_attributes :title_multiloc, :description_multiloc
end
