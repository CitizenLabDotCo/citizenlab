# frozen_string_literal: true

class WebApi::V1::Invites::InvitesImportSerializer < WebApi::V1::BaseSerializer
  attributes :result, :completed_at, :created_at, :updated_at
end
