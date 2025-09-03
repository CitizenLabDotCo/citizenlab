# frozen_string_literal: true

module WebApi::V1::Verification
  class LockedAttributeSerializer < ::WebApi::V1::BaseSerializer
    attributes :name
  end
end
