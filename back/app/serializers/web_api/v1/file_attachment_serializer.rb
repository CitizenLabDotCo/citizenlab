# frozen_string_literal: true

# TODO: Reproduce the `WebApi::V1::FileSerializer` to avoid breaking changes. It might
#   deserve its own serializer in the future.
class WebApi::V1::FileAttachmentSerializer < WebApi::V1::BaseSerializer
  set_type :file

  attribute :ordering, &:position

  attribute(:file) { |attachment| { url: attachment.file.content.url } }
  attribute(:name) { |attachment| attachment.file.name }
  attribute(:size) { |attachment| attachment.file.size }
  attribute(:created_at) { |attachment| attachment.file.created_at }
  attribute(:updated_at) { |attachment| attachment.file.updated_at }
end
