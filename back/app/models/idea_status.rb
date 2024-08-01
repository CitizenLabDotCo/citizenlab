# frozen_string_literal: true

# == Schema Information
#
# Table name: idea_statuses
#
#  id                   :uuid             not null, primary key
#  title_multiloc       :jsonb
#  ordering             :integer
#  code                 :string
#  color                :string
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  description_multiloc :jsonb
#  ideas_count          :integer          default(0)
#  participation_method :string           default("ideation"), not null
#
class IdeaStatus < ApplicationRecord
  CODES = %w[proposed threshold_reached expired viewed under_consideration accepted implemented rejected answered ineligible custom].freeze

  acts_as_list column: :ordering, top_of_list: 0, scope: [:participation_method]

  default_scope -> { order(ordering: :asc) }

  has_many :ideas

  before_validation :strip_title
  before_destroy :remove_notifications # Must occur before has_many :notifications (see https://github.com/rails/rails/issues/5205)
  has_many :notifications, foreign_key: :post_status_id, dependent: :nullify

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :description_multiloc, presence: true, multiloc: { presence: true }
  validates :code, presence: true, inclusion: { in: CODES }
  validates :color, presence: true
  validates :participation_method, presence: true, inclusion: { in: %w[ideation proposals] }

  # abort_if_code_required to be the first before_destroy to be executed, but cannot be prepended.
  before_destroy :abort_if_code_required

  # TODO: move to observer, probably not the best solution as is.
  after_commit :move_default_to_top, unless: :default?, on: :update

  def default?
    self.class.default_status == self
  end

  def move_default_to_top
    self.class.default_status.tap do |default_status|
      break unless default_status

      default_status.move_to_top
      default_status.save
    end
  end

  def self.default_status
    order(created_at: :asc).find_by(code: :proposed)
  end

  def self.create_defaults
    locales = AppConfiguration.instance.settings('core', 'locales') || CL2_SUPPORTED_LOCALES
    code = 'proposed'
    title_multiloc = locales.to_h do |locale|
      translation = I18n.with_locale(locale) { I18n.t("statuses.#{code}") }
      [locale, translation]
    end
    description_multiloc = locales.to_h do |locale|
      translation = I18n.with_locale(locale) { I18n.t("statuses.#{code}_description") }
      [locale, translation]
    end
    IdeaStatus.create(
      title_multiloc: title_multiloc,
      ordering: i + 1,
      code: code,
      color: Faker::Color.hex_color,
      description_multiloc: description_multiloc
    )
  end

  def custom?
    code == 'custom'
  end

  private

  def strip_title
    title_multiloc.each { |key, value| title_multiloc[key] = value.strip }
  end

  def remove_notifications
    notifications.each do |notification|
      unless notification.update post_status: nil
        notification.destroy!
      end
    end
  end
end
