class CustomField < ApplicationRecord
  acts_as_list column: :ordering, top_of_list: 0, scope: [:resource_type]

  has_many :custom_field_options, dependent: :destroy

  FIELDABLE_TYPES = %w(User)
  INPUT_TYPES = %w(text number multiline_text select multiselect checkbox date)

  CODES = %w(gender birthyear domicile education)

  validates :resource_type, presence: true, inclusion: {in: FIELDABLE_TYPES}
  validates :key, presence: true, uniqueness: {scope: [:resource_type]}, format: { with: /\A[a-zA-Z0-9_]+\z/,
    message: "only letters, numbers and underscore" }
  validates :input_type, presence: true, inclusion: INPUT_TYPES
  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validates :description_multiloc, multiloc: {presence: false}
  validates :required, inclusion: {in: [true, false]}
  validates :enabled, inclusion: {in: [true, false]}
  validates :code, inclusion: {in: CODES}, uniqueness: true, allow_nil: true


  before_validation :set_default_enabled
  before_validation :generate_key, on: :create


  scope :fields_for, -> (claz) { where(resource_type: claz.name.to_s) }
  scope :enabled, -> { where(enabled: true) }

  def support_options?
    %w(select multiselect).include?(input_type)
  end

  def set_default_enabled
    self.enabled = true if self.enabled.nil?
  end

  def generate_key
    if !self.key
      self.key = CustomFieldService.new.generate_key(self, title_multiloc.values.first) do |key_proposal|
        self.class.find_by(key: key_proposal, resource_type: self.resource_type)
      end
    end
  end
end
