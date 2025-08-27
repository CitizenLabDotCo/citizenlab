# frozen_string_literal: true

class WebApi::V1::FileAttachmentSerializerAsLegacyFile < WebApi::V1::BaseSerializer
  set_type :file
  set_id :file_id

  attribute :ordering, &:position

  attribute(:file) { |attachment| { url: attachment.file.content.url } }
  attribute(:name) { |attachment| attachment.file.name }
  attribute(:size) { |attachment| attachment.file.size }
  attribute(:created_at) { |attachment| attachment.file.created_at }
  attribute(:updated_at) { |attachment| attachment.file.updated_at }
end
