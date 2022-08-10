# frozen_string_literal: true

class FieldVisitorService
  def visit(field)
    field.accept self
  end

  def visit_text(_field)
    default(field)
  end

  def visit_number(_field)
    default(field)
  end

  def visit_multiline_text(_field)
    default(field)
  end

  def visit_html(_field)
    default(field)
  end

  def visit_text_multiloc(_field)
    default(field)
  end

  def visit_multiline_text_multiloc(_field)
    default(field)
  end

  def visit_html_multiloc(_field)
    default(field)
  end

  def visit_select(_field)
    default(field)
  end

  def visit_multiselect(_field)
    default(field)
  end

  def visit_checkbox(_field)
    default(field)
  end

  def visit_date(_field)
    default(field)
  end

  def visit_files(_field)
    default(field)
  end

  def visit_image_files(_field)
    default(field)
  end

  def visit_point(_field)
    default(field)
  end

  def default(field)
    # Do nothing
  end
end
