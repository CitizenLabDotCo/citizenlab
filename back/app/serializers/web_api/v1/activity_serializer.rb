# frozen_string_literal: true

class WebApi::V1::ActivitySerializer < WebApi::V1::BaseSerializer
  attributes :action, :acted_at, :item_id, :project_id

  attribute :item_type do |object|
    object.item_type.demodulize.downcase
  end

  attribute :item_slug do |object|
    object&.item&.try(:slug)
  end

  attribute :item_title_multiloc do |object|
    item_name = object.item_type == 'ProjectFolders::Folder' ? 'project_folder' : object.item_type.demodulize.downcase
    payload_title = object.payload.dig(item_name, 'title_multiloc')

    payload_title || object.item.try(:title_multiloc)
  end

  attribute :change do |object|
    object.payload&.dig('change')
  end

  belongs_to :user
  belongs_to :item, polymorphic: true
end
