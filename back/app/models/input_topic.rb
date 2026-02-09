# frozen_string_literal: true

# == Schema Information
#
# Table name: input_topics
#
#  id                   :uuid             not null, primary key
#  project_id           :uuid             not null
#  title_multiloc       :jsonb            not null
#  description_multiloc :jsonb            not null
#  icon                 :string
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
#  index_input_topics_on_parent_id   (parent_id)
#  index_input_topics_on_project_id  (project_id)
#  index_input_topics_on_rgt         (rgt)
#
# Foreign Keys
#
#  fk_rails_...  (project_id => projects.id)
#
class InputTopic < ApplicationRecord
  extend OrderAsSpecified

  acts_as_nested_set scope: [:project_id], dependent: :destroy, counter_cache: :children_count

  belongs_to :project
  belongs_to :parent, class_name: 'InputTopic', optional: true, counter_cache: :children_count
  has_many :children, -> { order(:lft) }, class_name: 'InputTopic', foreign_key: :parent_id, dependent: :destroy, inverse_of: :parent

  has_many :ideas_input_topics, dependent: :destroy
  has_many :ideas, through: :ideas_input_topics

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :description_multiloc, multiloc: { presence: false }
  validate :max_depth_validation
  validate :icon_only_for_root_topics

  scope :order_ideas_count, lambda { |ideas, direction: :asc|
    topics_counts = IdeasCountService.counts(ideas, ['input_topic_id'])['input_topic_id']
    sorted_ids = ids.sort_by do |id|
      count = topics_counts[id] || 0
      direction == :desc ? -count : count
    end
    order_as_specified(id: sorted_ids)
  }

  # Returns "Parent > Child" format for subtopics
  def full_title_multiloc
    return title_multiloc if parent.blank?

    title_multiloc.to_h do |locale, title|
      parent_title = parent.title_multiloc[locale] || parent.title_multiloc.values.first
      [locale, "#{parent_title} > #{title}"]
    end
  end

  private

  def max_depth_validation
    return if parent.blank?

    errors.add(:parent_id, :too_deep) if parent.depth >= 1
  end

  def icon_only_for_root_topics
    return if icon.blank?

    errors.add(:icon, :not_allowed_for_subtopics) if depth.present? && depth >= 1
  end
end
