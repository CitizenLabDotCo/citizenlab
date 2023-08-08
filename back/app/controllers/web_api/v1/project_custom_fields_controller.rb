# frozen_string_literal: true
require 'prawn'
require 'prawn/measurement_extensions'

class WebApi::V1::ProjectCustomFieldsController < ApplicationController
  skip_after_action :verify_policy_scoped
  skip_after_action :verify_authorized
  skip_before_action :authenticate_user

  QUESTION_TYPES = %w[select multiselect text multiline_text]
  FORBIDDEN_HTML_TAGS_REGEX = /<\/?(div|span|ul|ol|li|em|img|a){1}[^>]*\/?>/

  def json_forms_schema
    if project && participation_context
      render json: raw_json(JsonFormsService.new.input_ui_and_json_multiloc_schemas(custom_fields, current_user, input_term))
    else
      send_not_found
    end
  end

  def to_pdf
    pdf = Prawn::Document.new(page_size: 'A4')

    custom_fields.each_with_index do |custom_field, i|
      # First custom_field should always be a page.
      # Since the pdf already has a page when it's
      # created we can skip this.
      next if i == 0

      field_type = custom_field.input_type

      if field_type == 'page' then
        pdf.start_new_page(size: 'A4')
        next
      end

      # Skip unsupported question types
      next unless QUESTION_TYPES.include? field_type
      
      # Write title
      write_title(pdf, custom_field)

      # Write description if it exists
      write_description(pdf, custom_field)

      pdf.move_down 7.mm

      if field_type == 'select' then
        custom_field.options.each do |option|
          pdf.stroke_color '000000'
          pdf.stroke_circle [3.mm, pdf.cursor], 5

          pdf.bounding_box([7.mm, pdf.cursor + 4], width: 180.mm, height: 10.mm) do
            pdf.text option.title_multiloc[params[:locale]]
          end
        end
      end

      if field_type == 'multiselect' then
        custom_field.options.each do |option|
          pdf.stroke do
            pdf.stroke_color '000000'
            pdf.rectangle([1.5.mm, pdf.cursor + 1.5.mm], 10, 10)
          end

          pdf.bounding_box([7.mm, pdf.cursor + 4], width: 180.mm, height: 10.mm) do
            pdf.text option.title_multiloc[params[:locale]]
          end
        end
      end

      if field_type == 'text' then
        draw_text_line(pdf)
      end

      if field_type == 'multiline_text' then
        (1..7).each do
          draw_text_line(pdf)
        end
      end

      pdf.move_down 6.mm
    end

    send_data(
      pdf.render,
      type: 'application/pdf',
      filename: 'survey.pdf'
    )
  end

  private

  def project
    @project ||= Project.find_by id: params[:project_id]
  end

  def participation_context
    @participation_context ||= ParticipationContextService.new.get_participation_context project
  end

  def input_term
    participation_context ? participation_context.input_term : project.input_term
  end

  def custom_fields
    IdeaCustomFieldsService.new(Factory.instance.participation_method_for(participation_context).custom_form).enabled_fields
  end

  def write_title(pdf, custom_field)
    pdf.text(
      "<b>#{custom_field.title_multiloc[params[:locale]]}</b>",
      size: 20,
      inline_format: true
    )
  end

  def write_description(pdf, custom_field)
    description = custom_field.description_multiloc[params[:locale]]
 
    unless description.nil? then
      pdf.move_down 3.mm
      paragraphs = parse_html_tags(description)

      paragraphs.each do |paragraph|
        pdf.text(paragraph, inline_format: true)
      end

      pdf.move_down 2.mm
    end
  end

  def parse_html_tags(string)
    string
      .gsub(FORBIDDEN_HTML_TAGS_REGEX, '')
      .gsub('<p>', '')
      .split('</p>')
  end

  def draw_text_line(pdf)
    pdf.text '_' * 47, color: 'EBEBEB', size: 20
  end
end
