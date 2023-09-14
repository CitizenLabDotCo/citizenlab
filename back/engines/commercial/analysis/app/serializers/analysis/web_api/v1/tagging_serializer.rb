# frozen_string_literal: true

class Analysis::WebApi::V1::TaggingSerializer < WebApi::V1::BaseSerializer
  belongs_to :tag, class_name: 'Analysis::Tag'
  belongs_to :input, class_name: 'Idea'
end
