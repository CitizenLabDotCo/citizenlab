# frozen_string_literal: true

# == Schema Information
#
# Table name: default_input_topics
#
#  id                   :uuid             not null, primary key
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
#  index_default_input_topics_on_parent_id  (parent_id)
#  index_default_input_topics_on_rgt        (rgt)
#
class DefaultInputTopic < ApplicationRecord
  acts_as_nested_set dependent: :destroy, counter_cache: :children_count

  belongs_to :parent, class_name: 'DefaultInputTopic', optional: true, counter_cache: :children_count
  has_many :children, -> { order(:lft) }, class_name: 'DefaultInputTopic', foreign_key: :parent_id, dependent: :destroy, inverse_of: :parent

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :description_multiloc, multiloc: { presence: false }
  validate :max_depth_validation

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
end
