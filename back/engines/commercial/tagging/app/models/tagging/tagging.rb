# == Schema Information
#
# Table name: tagging_taggings
#
#  id                :uuid             not null, primary key
#  assignment_method :integer          default("automatic")
#  idea_id           :uuid
#  tag_id            :uuid
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  confidence_score  :float
#
# Indexes
#
#  index_tagging_taggings_on_idea_id             (idea_id)
#  index_tagging_taggings_on_idea_id_and_tag_id  (idea_id,tag_id) UNIQUE
#  index_tagging_taggings_on_tag_id              (tag_id)
#
# Foreign Keys
#
#  fk_rails_...  (idea_id => ideas.id)
#  fk_rails_...  (tag_id => tagging_tags.id)
#
module Tagging
  class Tagging < ApplicationRecord
    enum assignment_method: %i[automatic manual]

    belongs_to :idea
    belongs_to :tag

    accepts_nested_attributes_for :tag
    validates_uniqueness_of :tag_id, scope: :idea_id
  end
end
