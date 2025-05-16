# frozen_string_literal: true

# == Schema Information
#
# Table name: topics
#
#  id                    :uuid             not null, primary key
#  title_multiloc        :jsonb
#  description_multiloc  :jsonb
#  icon                  :string
#  created_at            :datetime         not null
#  updated_at            :datetime         not null
#  ordering              :integer
#  code                  :string           default("custom"), not null
#  followers_count       :integer          default(0), not null
#  include_in_onboarding :boolean          default(FALSE), not null
#
# Indexes
#
#  index_topics_on_include_in_onboarding  (include_in_onboarding)
#
class Topic < ApplicationRecord
  extend OrderAsSpecified

  DEFAULT_CODES = %w[nature waste sustainability mobility technology economy housing public_space safety education culture health inclusion community services other].freeze
  CUSTOM_CODE = 'custom'
  OTHER_CODE = 'other'
  CODES = DEFAULT_CODES + [CUSTOM_CODE]

  acts_as_list column: :ordering, top_of_list: 0, add_new_at: :top

  has_many :projects_topics, dependent: :destroy
  has_many :projects_allowed_input_topics, dependent: :destroy
  has_many :projects, through: :projects_allowed_input_topics
  has_many :ideas_topics, dependent: :destroy
  has_many :ideas, through: :ideas_topics
  has_many :followers, as: :followable, dependent: :destroy

  has_many :static_pages_topics, dependent: :restrict_with_error
  has_many :static_pages, through: :static_pages_topics

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :description_multiloc, multiloc: { presence: false }
  validates :code, inclusion: { in: CODES }
  validates :include_in_onboarding, inclusion: { in: [true, false] }

  before_validation :set_code
  before_validation :sanitize_description_multiloc
  before_validation :sanitize_title_multiloc
  before_validation :strip_title

  scope :order_new, ->(direction = :desc) { order(created_at: direction, id: direction) }
  scope :order_projects_count, lambda { |direction = :desc|
    safe_dir = direction == :desc ? 'DESC' : 'ASC'
    left_outer_joins(:projects_topics)
      .group(:id)
      .order("COUNT(projects_topics.project_id) #{safe_dir}, ordering")
  }
  scope :order_ideas_count, lambda { |ideas, direction: :asc|
    topics_counts = IdeasCountService.counts(ideas, ['topic_id'])['topic_id']
    other_ids = where(code: OTHER_CODE).ids
    sorted_ids = ids.sort_by do |id|
      next Float::INFINITY if other_ids.include?(id)

      count = topics_counts[id] || 0
      direction == :desc ? -count : count
    end
    order_as_specified(id: sorted_ids)
  }
  scope :defaults, -> { where(code: DEFAULT_CODES) }

  def custom?
    code == CUSTOM_CODE
  end

  private

  def set_code
    self.code ||= CUSTOM_CODE
  end

  def sanitize_description_multiloc
    return unless description_multiloc&.any?

    self.description_multiloc = SanitizationService.new.sanitize_multiloc(
      description_multiloc,
      []
    )
  end

  def sanitize_title_multiloc
    return unless title_multiloc&.any?

    self.title_multiloc = SanitizationService.new.sanitize_multiloc(
      title_multiloc,
      []
    )
  end

  def strip_title
    return unless description_multiloc&.any?

    title_multiloc.each do |key, value|
      title_multiloc[key] = value.strip
    end
  end
end

Topic.include(SmartGroups::Concerns::ValueReferenceable)
