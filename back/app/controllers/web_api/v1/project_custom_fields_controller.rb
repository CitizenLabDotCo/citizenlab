# frozen_string_literal: true
require 'prawn'
require 'prawn/measurement_extensions'

class WebApi::V1::ProjectCustomFieldsController < ApplicationController
  skip_after_action :verify_policy_scoped
  skip_after_action :verify_authorized
  skip_before_action :authenticate_user

  QUESTION_TYPES = %w[select]
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

      if custom_field.input_type == 'page' then
        pdf.start_new_page(size: 'A4')
        next
      end

      locale = params[:locale]
      
      if QUESTION_TYPES.include? custom_field.input_type then
        # Write title
        pdf.text(
          "<b>#{custom_field.title_multiloc[locale]}</b>",
          size: 20,
          inline_format: true
        )

        # Write description if it exists
        description = custom_field.description_multiloc[locale]

        puts description
 
        unless description.nil? then
          pdf.move_down 5.mm

          paragraphs = parse_html_tags(description)
          puts paragraphs

          paragraphs.each do |paragraph|
            pdf.text(paragraph, inline_format: true)
          end
        end


      else
        puts custom_field.input_type
        # TODO throw error or something once we have covered all the fields
      end
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

  def parse_html_tags(string)
    string
      .gsub(FORBIDDEN_HTML_TAGS_REGEX, '')
      .gsub('</p>', '')
      .split(/<(p|br)>/)
      .filter { |str| !(%w[p br].include? str) }
  end
end
