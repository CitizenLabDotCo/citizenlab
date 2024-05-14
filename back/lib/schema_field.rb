class SchemaField
  def initialize(custom_field)
    @custom_field = custom_field
  end

  delegate :input_type, :title_multiloc, :description_multiloc, :key, :code, :enabled?, :required?, :hidden?, :page?, :section?, :other_option_text_field, :id, to: :custom_field

  def admin_field?
    code == 'budget' || code == 'author_id'
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
    when 'section'
      visitor.visit_section self
    when 'select'
      visitor.visit_select self
    when 'select_image'
      visitor.visit_select_image self
    when 'text'
      visitor.visit_text self
    when 'text_multiloc'
      visitor.visit_text_multiloc self
    when 'topic_ids'
      visitor.visit_topic_ids self
    else
      raise "Unsupported input type: #{input_type}"
    end
  end

  private

  attr_reader :custom_field
end
