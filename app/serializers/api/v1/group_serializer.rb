class Api::V1::GroupSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :slug

  has_many :memberships # or users?
  has_many :groups_projects

end