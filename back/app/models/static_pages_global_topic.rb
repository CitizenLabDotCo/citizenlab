# frozen_string_literal: true

# == Schema Information
#
# Table name: static_pages_global_topics
#
#  id              :uuid             not null, primary key
#  global_topic_id :uuid             not null
#  static_page_id  :uuid             not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_static_pages_global_topics_on_static_page_id   (static_page_id)
#  index_static_pages_global_topics_on_global_topic_id  (global_topic_id)
#
# Foreign Keys
#
#  fk_rails_...  (static_page_id => static_pages.id)
#  fk_rails_...  (global_topic_id => global_topics.id)
#
class StaticPagesGlobalTopic < ApplicationRecord
  belongs_to :static_page
  belongs_to :global_topic
end
