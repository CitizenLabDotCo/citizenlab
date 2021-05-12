class WebApi::V1::InappropriateContentFlagSerializer < ::WebApi::V1::BaseSerializer
  attributes :toxicity_label, :deleted_at
  attribute :reason_code do |object|
    if object.deleted_at
      nil
    else
      object.reason_code
    end
  end

  belongs_to :flaggable, polymorphic: true
end