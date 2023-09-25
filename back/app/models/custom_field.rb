# frozen_string_literal: true

# == Schema Information
#
# Table name: custom_fields
#
#  id                     :uuid             not null, primary key
#  resource_type          :string
#  key                    :string
#  input_type             :string
#  title_multiloc         :jsonb
#  description_multiloc   :jsonb
#  required               :boolean          default(FALSE)
#  ordering               :integer
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  enabled                :boolean          default(TRUE), not null
#  code                   :string
#  resource_id            :uuid
#  hidden                 :boolean          default(FALSE), not null
#  maximum                :integer
#  minimum_label_multiloc :jsonb            not null
#  maximum_label_multiloc :jsonb            not null
#  logic                  :jsonb            not null
#  answer_visible_to      :string
#  select_count_enabled   :boolean          default(FALSE), not null
#  maximum_select_count   :integer
#
# Indexes
#
#  index_custom_fields_on_resource_type_and_resource_id  (resource_type,resource_id)
#

# support table :
# Jsonforms (under dynamic_idea_form and jsonforms_custom_fields) supports all INPUT_TYPES
# The older react json form version works only with text number multiline_text select multiselect checkbox date
# The other types will fail for user custom fields and render a shallow schema for idea custom fields with only the required, hidden, title and description.
class CustomField < ApplicationRecord
  acts_as_list column: :ordering, top_of_list: 0, scope: [:resource_id]

  has_many :options, -> { order(:ordering) }, dependent: :destroy, class_name: 'CustomFieldOption', inverse_of: :custom_field
  has_many :text_images, as: :imageable, dependent: :destroy
  accepts_nested_attributes_for :text_images
  belongs_to :resource, polymorphic: true, optional: true
  has_many :permissions_custom_fields, dependent: :destroy
  has_many :permissions, through: :permissions_custom_fields

  FIELDABLE_TYPES = %w[User CustomForm].freeze
  INPUT_TYPES = %w[text number multiline_text html text_multiloc multiline_text_multiloc html_multiloc select multiselect checkbox date files image_files point linear_scale file_upload page section topic_ids].freeze
  CODES = %w[gender birthyear domicile education title_multiloc body_multiloc topic_ids location_description proposed_budget idea_images_attributes idea_files_attributes author_id budget ideation_section1 ideation_section2 ideation_section3].freeze
  VISIBLE_TO_PUBLIC = 'public'
  VISIBLE_TO_ADMINS = 'admins'

  validates :resource_type, presence: true, inclusion: { in: FIELDABLE_TYPES }
  validates(
    :key,
    presence: true,
    uniqueness: { scope: %i[resource_type resource_id] }, format: { with: /\A[a-zA-Z0-9_]+\z/, message: 'only letters, numbers and underscore' },
    unless: :page_or_section?
  )
  validates :input_type, presence: true, inclusion: INPUT_TYPES
  validates :title_multiloc, presence: true, multiloc: { presence: true }, unless: :page_or_section?
  validates :description_multiloc, multiloc: { presence: false, html: true }
  validates :required, inclusion: { in: [true, false] }
  validates :enabled, inclusion: { in: [true, false] }
  validates :hidden, inclusion: { in: [true, false] }
  validates :select_count_enabled, inclusion: { in: [true, false] }
  validates :code, inclusion: { in: CODES }, uniqueness: { scope: %i[resource_type resource_id] }, allow_nil: true
  validates :answer_visible_to, presence: true, inclusion: { in: [VISIBLE_TO_PUBLIC, VISIBLE_TO_ADMINS] }
  validates :maximum_select_count, comparison: { less_than_or_equal_to: ->(custom_field) {custom_field.options.size}, greater_than_or_equal_to: 0}, if: :multiselect?, allow_nil: true
  validates :minimum_select_count, comparison: { less_than_or_equal_to: :maximum_select_count}, if: :multiselect?, allow_nil: true

  before_validation :set_default_enabled
  before_validation :set_default_answer_visible_to
  before_validation :generate_key, on: :create
  before_validation :sanitize_description_multiloc
  after_create(if: :domicile?) { Area.recreate_custom_field_options }

  scope :with_resource_type, ->(resource_type) { where(resource_type: resource_type) }
  scope :registration, -> { where(resource_type: 'User') }
  scope :enabled, -> { where(enabled: true) }
  scope :disabled, -> { where(enabled: false) }
  scope :required, -> { where(required: true) }
  scope :not_hidden, -> { where(hidden: false) }
  scope :hidden, -> { where(hidden: true) }
  scope :support_multiple_values, -> { where(input_type: 'multiselect') }
  scope :support_single_value, -> { where.not(input_type: 'multiselect') }

  def logic?
    logic.present? && logic != { 'rules' => [] }
  end

  def support_options?
    %w[select multiselect].include?(input_type)
  end

  def support_free_text_value?
    %w[text multiline_text text_multiloc multiline_text_multiloc html_multiloc].include?(input_type)
  end

  def built_in?
    !!code
  end

  def hidden?
    hidden
  end

  def enabled?
    enabled
  end

  def required?
    required
  end

  def domicile?
    key == 'domicile' && code == 'domicile'
  end

  def file_upload?
    input_type == 'file_upload'
  end

  def page?
    input_type == 'page'
  end

  def section?
    input_type == 'section'
  end

  def multiselect?
    input_type == 'multiselect'
  end

  def page_or_section?
    page? || section?
  end

  def custom_form_type?
    resource_type == 'CustomForm'
  end

  def multiloc?
    %w[
      text_multiloc
      multiline_text_multiloc
      html_multiloc
    ].include?(input_type)
  end

  def accept(visitor)
    case input_type
    when 'text'
      visitor.visit_text self
    when 'number'
      visitor.visit_number self
    when 'multiline_text'
      visitor.visit_multiline_text self
    when 'html'
      visitor.visit_html self
    when 'text_multiloc'
      visitor.visit_text_multiloc self
    when 'multiline_text_multiloc'
      visitor.visit_multiline_text_multiloc self
    when 'html_multiloc'
      visitor.visit_html_multiloc self
    when 'select'
      visitor.visit_select self
    when 'multiselect'
      visitor.visit_multiselect self
    when 'checkbox'
      visitor.visit_checkbox self
    when 'date'
      visitor.visit_date self
    when 'files'
      visitor.visit_files self
    when 'image_files'
      visitor.visit_image_files self
    when 'point'
      visitor.visit_point self
    when 'linear_scale'
      visitor.visit_linear_scale self
    when 'page'
      visitor.visit_page self
    when 'section'
      visitor.visit_section self
    when 'file_upload'
      visitor.visit_file_upload self
    when 'topic_ids'
      visitor.visit_topic_ids self
    else
      raise "Unsupported input type: #{input_type}"
    end
  end

  # Special behaviour for ideation section 1
  def title_multiloc
    if code == 'ideation_section1'
      project = resource.participation_context
      phase = TimelineService.new.current_or_last_can_contain_ideas_phase project
      input_term = phase ? phase.input_term : project.input_term || ParticipationContext::DEFAULT_INPUT_TERM

      key = "custom_forms.categories.main_content.#{input_term}.title"
      MultilocService.new.i18n_to_multiloc key
    else
      super
    end
  end

  def project_id
    resource.project_id if resource_type == 'CustomForm'
  end

  private

  def set_default_enabled
    self.enabled = true if enabled.nil?
  end

  def set_default_answer_visible_to
    return unless answer_visible_to.nil?

    self.answer_visible_to = if custom_form_type? && (built_in? || page_or_section?)
      VISIBLE_TO_PUBLIC
    else
      VISIBLE_TO_ADMINS
    end
  end

  def generate_key
    return if key
    return if page_or_section?

    title = title_multiloc.values.first
    return unless title

    self.key = CustomFieldService.new.generate_key(self, title) do |key_proposal|
      self.class.find_by(key: key_proposal, resource_type: resource_type)
    end
  end

  def sanitize_description_multiloc
    service = SanitizationService.new
    self.description_multiloc = service.sanitize_multiloc(
      description_multiloc,
      %i[title alignment list decoration link image video]
    )
    self.description_multiloc = service.remove_multiloc_empty_trailing_tags description_multiloc
    self.description_multiloc = service.linkify_multiloc description_multiloc
  end
end

CustomField.include(SmartGroups::Extensions::CustomField)
CustomField.include(UserCustomFields::Patches::CustomField)
CustomField.include(Analysis::Patches::CustomField)
