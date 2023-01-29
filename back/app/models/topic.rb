# frozen_string_literal: true

# == Schema Information
#
# Table name: topics
#
#  id                   :uuid             not null, primary key
#  title_multiloc       :jsonb
#  description_multiloc :jsonb
#  icon                 :string
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  ordering             :integer
#  code                 :string           default("custom"), not null
#
class Topic < ApplicationRecord
  DEFAULT_CODES = %w[nature waste sustainability mobility technology economy housing public_space safety education culture health inclusion community services other].freeze
  CUSTOM_CODE = 'custom'
  CODES = DEFAULT_CODES + [CUSTOM_CODE]

  acts_as_list column: :ordering, top_of_list: 0, add_new_at: :top

  has_many :projects_topics, dependent: :destroy
  has_many :projects_allowed_input_topics, dependent: :destroy
  has_many :projects, through: :projects_allowed_input_topics
  has_many :ideas_topics, dependent: :destroy
  has_many :ideas, through: :ideas_topics
  has_many :initiatives_topics, dependent: :destroy
  has_many :initiatives, through: :initiatives_topics

  has_many :static_pages_topics, dependent: :restrict_with_error
  has_many :static_pages, through: :static_pages_topics

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :description_multiloc, multiloc: { presence: false }
  validates :code, inclusion: { in: CODES }

  before_validation :set_code
  before_validation :strip_title

  scope :order_new, ->(direction = :desc) { order(created_at: direction, id: direction) }
  scope :defaults, -> { where(code: DEFAULT_CODES) }

  def custom?
    code == CUSTOM_CODE
  end

  private

  def set_code
    self.code ||= CUSTOM_CODE
  end

  def strip_title
    title_multiloc.each do |key, value|
      title_multiloc[key] = value.strip
    end
  end
end
