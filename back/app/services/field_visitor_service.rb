# frozen_string_literal: true

class FieldVisitorService
  def visit(field)
    field.accept self
  end

  def visit_text(field)
    default(field)
  end

  def visit_number(field)
    default(field)
  end

  def visit_multiline_text(field)
    default(field)
  end

  def visit_html(field)
    default(field)
  end

  def visit_text_multiloc(field)
    default(field)
  end

  def visit_multiline_text_multiloc(field)
    default(field)
  end

  def visit_html_multiloc(field)
    default(field)
  end

  def visit_select(field)
    default(field)
  end

  def visit_multiselect(field)
    default(field)
  end

  def visit_checkbox(field)
    default(field)
  end

  def visit_date(field)
    default(field)
  end

  def visit_files(field)
    default(field)
  end

  def visit_image_files(field)
    default(field)
  end

  def visit_point(field)
    default(field)
  end

  def visit_linear_scale(field)
    default(field)
  end

  def default(field)
    # Do nothing
  end
end
