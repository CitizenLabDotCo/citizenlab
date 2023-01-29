# frozen_string_literal: true

# == Schema Information
#
# Table name: static_pages_topics
#
#  id             :uuid             not null, primary key
#  topic_id       :uuid             not null
#  static_page_id :uuid             not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_static_pages_topics_on_static_page_id  (static_page_id)
#  index_static_pages_topics_on_topic_id        (topic_id)
#
# Foreign Keys
#
#  fk_rails_...  (static_page_id => static_pages.id)
#  fk_rails_...  (topic_id => topics.id)
#
class StaticPagesTopic < ApplicationRecord
  belongs_to :static_page
  belongs_to :topic
end
