class CustomField < ApplicationRecord
  acts_as_list column: :ordering, top_of_list: 0, scope: [:resource_type]

  has_many :custom_field_options, dependent: :destroy
  belongs_to :resource, polymorphic: true, optional: true

  FIELDABLE_TYPES = %w(User CustomForm)
  INPUT_TYPES = %w(text number multiline_text select multiselect checkbox date files)
  CODES = %w(gender birthyear domicile education title body topic_ids location proposed_budget images attachments)

  validates :resource_type, presence: true, inclusion: {in: FIELDABLE_TYPES}
  validates :key, presence: true, uniqueness: {scope: [:resource_type, :resource_id]}, format: { with: /\A[a-zA-Z0-9_]+\z/,
    message: "only letters, numbers and underscore" }
  validates :input_type, presence: true, inclusion: INPUT_TYPES
  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validates :description_multiloc, multiloc: {presence: false}
  validates :required, inclusion: {in: [true, false]}
  validates :enabled, inclusion: {in: [true, false]}
  validates :hidden, inclusion: {in: [true, false]}
  validates :code, inclusion: {in: CODES}, uniqueness: {scope: [:resource_type, :resource_id]}, allow_nil: true


  before_validation :set_default_enabled
  before_validation :generate_key, on: :create
  before_validation :sanitize_description_multiloc
  before_destroy :check_group_references, prepend: true

  scope :with_resource_type, -> (resource_type) { where(resource_type: resource_type) }
  scope :enabled, -> { where(enabled: true) }
  scope :disabled, -> { where(enabled: false) }
  scope :not_hidden, -> { where(hidden: false) }
  scope :hidden, -> { where(hidden: true) }
  scope :support_multiple_values, -> { where(input_type: 'multiselect') }
  scope :support_single_value, -> { where.not(input_type: 'multiselect') }

  def support_options?
    %w(select multiselect).include?(input_type)
  end

  private

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

  def check_group_references
    if Group.using_custom_field(self).exists?
      self.errors.add(:base, :dangling_group_references, message: Group.using_custom_field(self).all.map(&:id).join(","))
      throw :abort
    end
  end

  def sanitize_description_multiloc
    service = SanitizationService.new
    self.description_multiloc = service.sanitize_multiloc(
      self.description_multiloc,
      %i{decoration link list title}
    )
    self.description_multiloc = service.remove_multiloc_empty_trailing_tags(self.description_multiloc)
    self.description_multiloc = service.linkify_multiloc(self.description_multiloc)
  end
end
