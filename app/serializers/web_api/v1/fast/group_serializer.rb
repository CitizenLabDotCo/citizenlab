class WebApi::V1::Fast::GroupSerializer < WebApi::V1::Fast::BaseSerializer
  attributes :title_multiloc, :slug, :membership_type, :memberships_count

  attribute :rules, if: Proc.new { |object|
    object.rules?
  }
end