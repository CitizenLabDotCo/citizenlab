# frozen_string_literal: true

class WebApi::V1::Invites::InvitesImportSerializer < WebApi::V1::BaseSerializer
  attributes :job_type, :result, :completed_at, :created_at, :updated_at

  belongs_to :importer, record_type: :user, serializer: WebApi::V1::UserSerializer
end
