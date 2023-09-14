# frozen_string_literal: true

# == Schema Information
#
# Table name: analysis_taggings
#
#  id                 :uuid             not null, primary key
#  tag_id             :uuid             not null
#  input_id           :uuid             not null
#  background_task_id :uuid
#
# Indexes
#
#  index_analysis_taggings_on_input_id             (input_id)
#  index_analysis_taggings_on_tag_id               (tag_id)
#  index_analysis_taggings_on_tag_id_and_input_id  (tag_id,input_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (input_id => ideas.id)
#  fk_rails_...  (tag_id => analysis_tags.id)
#
module Analysis
  class Tagging < ApplicationRecord
    belongs_to :tag, class_name: 'Analysis::Tag'
    belongs_to :input, class_name: 'Idea'
    belongs_to :background_task, class_name: 'AutoTaggingTask', optional: true

    validates :tag_id, presence: true, uniqueness: { scope: :input_id }
  end
end
