class WebApi::V1::ActivitySerializer < ActiveModel::Serializer
  attributes :id, :action, :acted_at, :change
  belongs_to :user

  def change
    object.payload&.dig('change')
  end
end
