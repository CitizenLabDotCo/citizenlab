class WebApi::V1::Fast::ActivitySerializer < WebApi::V1::Fast::BaseSerializer
  attributes :action, :acted_at

  attribute :change do |object|
    object.payload&.dig('change')
  end

  belongs_to :user
end
