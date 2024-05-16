# frozen_string_literal: true

class WebApi::V1::ActivitySerializer < WebApi::V1::BaseSerializer
  attributes :action, :acted_at, :item_id, :project_id

  attribute :item_type do |object|
    object.item_type.demodulize.downcase
  end

  attribute :item_slug do |object|
    object&.item&.try(:slug)
  end

  attribute :change do |object|
    object.payload&.dig('change')
  end

  belongs_to :user
  belongs_to :item, polymorphic: true
end
