class IdeaStatus < ApplicationRecord
  CODES = %w[proposed viewed under_consideration accepted implemented rejected custom].freeze
  MINIMUM_REQUIRED_CODES = %w[proposed].freeze

  acts_as_list column: :ordering, top_of_list: 0

  default_scope -> { order(ordering: :asc) }

  has_many :ideas
  has_many :notifications, foreign_key: :post_status_id, dependent: :nullify

  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :description_multiloc, presence: true, multiloc: { presence: true }
  validates :code, presence: true, inclusion: { in: CODES }, minimum_required: { values: MINIMUM_REQUIRED_CODES }
  validates :color, presence: true

  before_validation :strip_title
  # abort_if_code_required to be the first before_destroy to be executed, but cannot be prepended.
  before_destroy :abort_if_code_required
  before_destroy :remove_notifications

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
    (MINIMUM_REQUIRED_CODES - ['custom']).each.with_index do |code, i|
      title_multiloc = locales.map do |locale|
        translation = I18n.with_locale(locale){ I18n.t("statuses.#{code}") }
        [locale, translation]
      end.to_h
      description_multiloc = locales.map do |locale|
        translation = I18n.with_locale(locale){ I18n.t("statuses.#{code}_description") }
        [locale, translation]
      end.to_h
      IdeaStatus.create(
        title_multiloc: title_multiloc,
        ordering: i+1,
        code: code,
        color: Faker::Color.hex_color,
        description_multiloc: description_multiloc
      )
    end
  end

  def custom?
    code == 'custom'
  end

  private

  def strip_title
    title_multiloc.each { |key, value| title_multiloc[key] = value.strip }
  end

  def abort_if_code_required
    MinimumRequiredValidator.new(attributes: %i[code], values: MINIMUM_REQUIRED_CODES).validate(self)

    throw(:abort) if errors[:code].present?
  end

  def remove_notifications
    notifications.each do |notification|
      next if notification.update(post_status: nil)

      notification.destroy!
    end
  end
end
