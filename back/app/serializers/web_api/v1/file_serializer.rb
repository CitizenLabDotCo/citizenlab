# frozen_string_literal: true

class WebApi::V1::FileSerializer < WebApi::V1::BaseSerializer
  attributes :file, :ordering, :name, :size, :created_at, :updated_at

  attribute :size do |object|
    # Temporary fix: cache the size to avoid always triggering a file download from S3.
    Rails.cache.fetch("#{object.cache_key_with_version}/size") do
      object.file.size
    end
  end

  # Keeps the response in sync with WebApi::V1::FileAttachmentSerializerAsLegacyFile.
  # This serializer is used both for legacy per-resource files (which carry the title on
  # their migrated Files::File, if any) and for Files::File records directly (e.g. files
  # attached to an analysis), which expose +title_multiloc+ themselves.
  attribute(:title_multiloc) do |object|
    if object.respond_to?(:title_multiloc)
      object.title_multiloc
    else
      object.try(:migrated_file)&.title_multiloc || {}
    end
  end
end
