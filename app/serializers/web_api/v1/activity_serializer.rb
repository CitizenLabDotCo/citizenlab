class WebApi::V1::ActivitySerializer < WebApi::V1::BaseSerializer
  attributes :action, :acted_at

  attribute :change do |object|
    object.payload&.dig('change')
  end

  belongs_to :user
end
