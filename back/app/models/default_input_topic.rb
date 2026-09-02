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
  include PlainTextMultiloc
  acts_as_nested_set dependent: :destroy, counter_cache: :children_count

  belongs_to :parent, class_name: 'DefaultInputTopic', optional: true, counter_cache: :children_count
  has_many :children, -> { order(:lft) }, class_name: 'DefaultInputTopic', foreign_key: :parent_id, dependent: :destroy, inverse_of: :parent

  # Rendered with `dangerouslySetInnerHTML` (`<T supportHtml>`), and the editor offers bold and
  # italic only, so the allowlist is narrower than the other description fields'.
  DESCRIPTION_SANITIZE_FEATURES = %i[decoration].freeze

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :description_multiloc, multiloc: { presence: false }
  validate :max_depth_validation

  plain_text_multiloc :title_multiloc
  before_validation :sanitize_description_multiloc, if: :description_multiloc

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

  # No linkifying, unlike the other description fields: the editor cannot make links, so neither
  # does this.
  def sanitize_description_multiloc
    service = SanitizationService.new
    self.description_multiloc = service.sanitize_multiloc(description_multiloc, DESCRIPTION_SANITIZE_FEATURES)
    self.description_multiloc = service.remove_multiloc_empty_trailing_tags description_multiloc
  end
end
