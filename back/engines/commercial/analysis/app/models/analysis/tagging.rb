# frozen_string_literal: true

module Analysis
  class Tagging < ApplicationRecord
    belongs_to :tag, class_name: 'Analysis::Tag'
    belongs_to :input, class_name: 'Idea'

    validates :tag_id, presence: true, uniqueness: { scope: :input_id }
  end
end
