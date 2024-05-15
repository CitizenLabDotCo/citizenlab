# frozen_string_literal: true

class WebApi::V1::ActivitySerializer < WebApi::V1::BaseSerializer
  attributes :action, :acted_at, :item_type, :item_id, :project_id

  attribute :change do |object|
    object.payload&.dig('change')
  end

  belongs_to :user
  belongs_to :item, polymorphic: true
end
