class WebApi::V1::GroupSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :slug, :membership_type, :memberships_count

  attribute :rules, if: :rules?

  def rules?
    object.rules?
  end
end