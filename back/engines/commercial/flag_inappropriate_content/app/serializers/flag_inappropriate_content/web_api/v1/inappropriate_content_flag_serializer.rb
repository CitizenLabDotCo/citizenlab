module FlagInappropriateContent
  class WebApi::V1::InappropriateContentFlagSerializer < ::WebApi::V1::BaseSerializer
    attributes :toxicity_label, :deleted_at
    attribute :reason_code do |flag|
      if flag.deleted?
        nil
      else
        flag.reason_code
      end
    end

    belongs_to :flaggable, polymorphic: true
  end
end