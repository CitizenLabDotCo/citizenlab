# frozen_string_literal: true

class WebApi::V1::FileSerializer < WebApi::V1::BaseSerializer
  attributes :file, :ordering, :name, :size, :created_at, :updated_at

  attribute :size do |object|
    # Temporary fix: cache the size to avoid always triggering a file download from S3.
    Rails.cache.fetch("#{object.cache_key_with_version}/size") do
      object.file.size
    end
  end
end
