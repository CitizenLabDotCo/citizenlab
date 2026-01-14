# frozen_string_literal: true

# == Schema Information
#
# Table name: global_topics
#
#  id                    :uuid             not null, primary key
#  title_multiloc        :jsonb
#  description_multiloc  :jsonb
#  icon                  :string
#  created_at            :datetime         not null
#  updated_at            :datetime         not null
#  ordering              :integer
#  followers_count       :integer          default(0), not null
#  include_in_onboarding :boolean          default(FALSE), not null
#  is_default            :boolean          default(FALSE), not null
#
# Indexes
#
#  index_global_topics_on_include_in_onboarding  (include_in_onboarding)
#
class GlobalTopic < ApplicationRecord
  extend OrderAsSpecified

  # Temporary fix while deploying, since Topic is a View instead of a Table, and
  # rails can't detect the primary key automatically
  self.primary_key = 'id'

  acts_as_list column: :ordering, top_of_list: 0, add_new_at: :top

  has_many :projects_global_topics, dependent: :destroy
  has_many :static_pages_global_topics, dependent: :restrict_with_error
  has_many :static_pages, through: :static_pages_global_topics

  # Followers (polymorphic)
  has_many :followers, as: :followable, dependent: :destroy

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :description_multiloc, multiloc: { presence: false }
  validates :include_in_onboarding, inclusion: { in: [true, false] }
  validates :is_default, inclusion: { in: [true, false] }

  scope :defaults, -> { where(is_default: true) }

  before_validation :strip_title

  scope :order_new, ->(direction = :desc) { order(created_at: direction, id: direction) }
  scope :order_projects_count, lambda { |direction = :desc|
    safe_dir = direction == :desc ? 'DESC' : 'ASC'
    left_outer_joins(:projects_global_topics)
      .group(:id)
      .order("COUNT(projects_global_topics.project_id) #{safe_dir}, ordering")
  }

  private

  def strip_title
    return unless description_multiloc&.any?

    title_multiloc.each do |key, value|
      title_multiloc[key] = value.strip
    end
  end
end

GlobalTopic.include(SmartGroups::Concerns::ValueReferenceable)
