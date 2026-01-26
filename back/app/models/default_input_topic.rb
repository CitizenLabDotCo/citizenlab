# frozen_string_literal: true

# == Schema Information
#
# Table name: default_input_topics
#
#  id                   :uuid             not null, primary key
#  title_multiloc       :jsonb            not null
#  description_multiloc :jsonb            not null
#  icon                 :string
#  ordering             :integer          default(0), not null
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  parent_id            :uuid
#  lft                  :integer
#  rgt                  :integer
#  depth                :integer          default(0)
#  children_count       :integer          default(0)
#
# Indexes
#
#  index_default_input_topics_on_parent_id  (parent_id)
#  index_default_input_topics_on_rgt        (rgt)
#
class DefaultInputTopic < ApplicationRecord
  acts_as_list column: :ordering, top_of_list: 0

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :description_multiloc, multiloc: { presence: false }
end
