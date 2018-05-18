class IdeaStatus < ApplicationRecord

  CODES = %w(proposed under_consideration accepted implemented rejected custom)

  has_many :ideas, dependent: :nullify
  has_many :notifications, foreign_key: :idea_status_id, dependent: :nullify

  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validates :code, inclusion: {in: CODES}
  validates :code, uniqueness: true, unless: :custom?
  validates :description_multiloc, presence: true, multiloc: {presence: true}

  before_validation :strip_title


  def self.create_defaults
    (CODES - ['custom']).each.with_index do |code, i|
      title_multiloc = I18n.available_locales.map do |locale|
        translation = I18n.with_locale(locale){ I18n.t("statuses.#{code}") }
        [locale, translation]
      end.to_h
      description_multiloc = I18n.available_locales.map do |locale|
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
    self.code == 'custom'
  end


  private

  def strip_title
    self.title_multiloc.each do |key, value|
      self.title_multiloc[key] = value.strip
    end
  end

end
