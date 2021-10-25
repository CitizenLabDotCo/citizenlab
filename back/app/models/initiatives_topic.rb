# == Schema Information
#
# Table name: initiatives_topics
#
#  id            :uuid             not null, primary key
#  initiative_id :uuid
#  topic_id      :uuid
#
# Indexes
#
#  index_initiatives_topics_on_initiative_id               (initiative_id)
#  index_initiatives_topics_on_initiative_id_and_topic_id  (initiative_id,topic_id) UNIQUE
#  index_initiatives_topics_on_topic_id                    (topic_id)
#
# Foreign Keys
#
#  fk_rails_...  (initiative_id => initiatives.id)
#  fk_rails_...  (topic_id => topics.id)
#
class InitiativesTopic < ApplicationRecord
  belongs_to :initiative
  belongs_to :topic

  validates :initiative, :topic, presence: true
  # We would do this:
  # validates :topic_id, uniqueness: {scope: :initiative_id}
  # but the uniqueness validation fails on records without primary key, so there's
  # a database-level unique index instead
end
