# frozen_string_literal: true

# == Schema Information
#
# Table name: custom_fields
#
#  id                            :uuid             not null, primary key
#  resource_type                 :string
#  key                           :string
#  input_type                    :string
#  title_multiloc                :jsonb
#  description_multiloc          :jsonb
#  required                      :boolean          default(FALSE)
#  ordering                      :integer
#  created_at                    :datetime         not null
#  updated_at                    :datetime         not null
#  enabled                       :boolean          default(TRUE), not null
#  code                          :string
#  resource_id                   :uuid
#  hidden                        :boolean          default(FALSE), not null
#  maximum                       :integer
#  logic                         :jsonb            not null
#  answer_visible_to             :string
#  select_count_enabled          :boolean          default(FALSE), not null
#  maximum_select_count          :integer
#  minimum_select_count          :integer
#  random_option_ordering        :boolean          default(FALSE), not null
#  page_layout                   :string
#  linear_scale_label_1_multiloc :jsonb            not null
#  linear_scale_label_2_multiloc :jsonb            not null
#  linear_scale_label_3_multiloc :jsonb            not null
#  linear_scale_label_4_multiloc :jsonb            not null
#  linear_scale_label_5_multiloc :jsonb            not null
#  linear_scale_label_6_multiloc :jsonb            not null
#  linear_scale_label_7_multiloc :jsonb            not null
#  dropdown_layout               :boolean          default(FALSE), not null
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
  INPUT_TYPES = %w[
    checkbox date file_upload files html html_multiloc image_files linear_scale multiline_text multiline_text_multiloc
    multiselect multiselect_image number page point line polygon select select_image shapefile_upload text text_multiloc
    topic_ids section cosponsor_ids ranking
  ].freeze
  CODES = %w[
    author_id birthyear body_multiloc budget domicile education gender idea_files_attributes idea_images_attributes
    ideation_section1 ideation_section2 ideation_section3 location_description proposed_budget title_multiloc topic_ids cosponsor_ids
  ].freeze
  VISIBLE_TO_PUBLIC = 'public'
  VISIBLE_TO_ADMINS = 'admins'
  PAGE_LAYOUTS = %w[default map].freeze

  validates :resource_type, presence: true, inclusion: { in: FIELDABLE_TYPES }
  validates(
    :key,
    presence: true,
    uniqueness: { scope: %i[resource_type resource_id] }, format: { with: /\A[a-zA-Z0-9_]+\z/, message: 'only letters, numbers and underscore' },
    if: :accepts_input?
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
  validates :maximum_select_count, comparison: { greater_than_or_equal_to: 0 }, if: :multiselect?, allow_nil: true
  validates :minimum_select_count, comparison: { greater_than_or_equal_to: 0 }, if: :multiselect?, allow_nil: true
  validates :page_layout, presence: true, inclusion: { in: PAGE_LAYOUTS }, if: :page?
  validates :page_layout, absence: true, unless: :page?

  before_validation :set_default_enabled
  before_validation :set_default_answer_visible_to
  before_validation :generate_key, on: :create
  before_validation :sanitize_description_multiloc
  after_create(if: :domicile?) { Area.recreate_custom_field_options }

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
    %w[select multiselect select_image multiselect_image ranking].include?(input_type)
  end

  def support_free_text_value?
    %w[text multiline_text text_multiloc multiline_text_multiloc html_multiloc].include?(input_type)
  end

  def support_option_images?
    %w[select_image multiselect_image].include?(input_type)
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
    input_type == 'file_upload' || input_type == 'shapefile_upload'
  end

  def page?
    input_type == 'page'
  end

  def section?
    input_type == 'section'
  end

  def multiselect?
    %w[multiselect multiselect_image].include?(input_type)
  end

  def linear_scale?
    input_type == 'linear_scale'
  end

  def page_or_section?
    page? || section?
  end

  def dropdown_layout_type?
    %w[multiselect select].include?(input_type)
  end

  def accepts_input?
    !page_or_section?
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
    when 'checkbox'
      visitor.visit_checkbox self
    when 'date'
      visitor.visit_date self
    when 'files'
      visitor.visit_files self
    when 'file_upload'
      visitor.visit_file_upload self
    when 'html'
      visitor.visit_html self
    when 'html_multiloc'
      visitor.visit_html_multiloc self
    when 'image_files'
      visitor.visit_image_files self
    when 'linear_scale'
      visitor.visit_linear_scale self
    when 'multiline_text'
      visitor.visit_multiline_text self
    when 'multiline_text_multiloc'
      visitor.visit_multiline_text_multiloc self
    when 'multiselect'
      visitor.visit_multiselect self
    when 'multiselect_image'
      visitor.visit_multiselect_image self
    when 'number'
      visitor.visit_number self
    when 'page'
      visitor.visit_page self
    when 'point'
      visitor.visit_point self
    when 'line'
      visitor.visit_line self
    when 'polygon'
      visitor.visit_polygon self
    when 'section'
      visitor.visit_section self
    when 'select'
      visitor.visit_select self
    when 'select_image'
      visitor.visit_select_image self
    when 'shapefile_upload'
      visitor.visit_shapefile_upload self
    when 'text'
      visitor.visit_text self
    when 'text_multiloc'
      visitor.visit_text_multiloc self
    when 'topic_ids'
      visitor.visit_topic_ids self
    when 'cosponsor_ids'
      visitor.visit_cosponsor_ids self
    else
      raise "Unsupported input type: #{input_type}"
    end
  end

  # Special behaviour for ideation section 1
  def title_multiloc
    if code == 'ideation_section1'
      key = "custom_forms.categories.main_content.#{input_term}.title"
      MultilocService.new.i18n_to_multiloc key
    else
      super
    end
  end

  def project_id
    resource.project_id if resource_type == 'CustomForm'
  end

  def other_option_text_field
    return if options.none?(&:other)

    other_field_key = "#{key}_other"
    title_multiloc = MultilocService.new.i18n_to_multiloc(
      'custom_fields.ideas.other_input_field.title',
      locales: CL2_SUPPORTED_LOCALES
    )

    # Replace {other_option} in the title string with the title of the other option
    other_option = options.detect { |o| o[:other] == true }
    replace_string = '{other_option}'
    replaced_title_multiloc = {}
    title_multiloc.each do |locale, title|
      replaced_title_multiloc[locale] = if other_option.title_multiloc[locale.to_s]
        title.gsub(/#{replace_string}/, other_option.title_multiloc[locale.to_s]) if other_option.title_multiloc[locale.to_s]
      else
        title
      end
    end

    CustomField.new(
      key: other_field_key,
      input_type: 'text',
      title_multiloc: replaced_title_multiloc,
      required: true,
      enabled: true
    )
  end

  def ordered_options
    @ordered_options ||= if random_option_ordering
      options.shuffle.sort_by { |o| o.other ? 1 : 0 }
    else
      options.order(:ordering)
    end
  end

  def linear_scale_print_description(locale)
    return nil unless linear_scale?

    multiloc_service = MultilocService.new

    min_text = multiloc_service.t(linear_scale_label_1_multiloc, locale)
    min_label = "1#{min_text.present? ? " (#{min_text})" : ''}"

    max_text = multiloc_service.t(nth_linear_scale_multiloc(maximum), locale)
    max_label = maximum.to_s + (max_text.present? ? " (#{max_text})" : '')

    I18n.with_locale(locale) do
      I18n.t(
        'form_builder.pdf_export.linear_scale_print_description',
        min_label: min_label,
        max_label: max_label
      )
    end
  end

  def nth_linear_scale_multiloc(n)
    send(:"linear_scale_label_#{n}_multiloc")
  end

  def input_term
    phase = if resource.participation_context.instance_of?(Project)
      TimelineService.new.current_or_backup_transitive_phase(resource.participation_context)
    else
      resource.participation_context
    end
    phase&.input_term || Phase::FALLBACK_INPUT_TERM
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
    return if !accepts_input?

    title = title_multiloc.values.first
    return unless title

    self.key = CustomFieldService.new.generate_key(title, false) do |key_proposal|
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
CustomField.include(CustomMaps::Extensions::CustomField)
