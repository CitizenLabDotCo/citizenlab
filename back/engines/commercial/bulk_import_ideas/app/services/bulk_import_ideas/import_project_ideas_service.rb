# frozen_string_literal: true

module BulkImportIdeas
  class ImportProjectIdeasService < ImportIdeasService
    def initialize(current_user, project_id, locale)
      @project = Project.find(project_id)
      @project_fields = IdeaCustomFieldsService.new(Factory.instance.participation_method_for(@project).custom_form).enabled_fields
      @locale = locale # TODO: Initialise with default locale for the platform
      super(current_user)
    end

    def generate_example_xlsx
      columns = {
        'ID' => '1',
        'Locale' => 'en',
        'Email' => 'moderator@citizenlab.co',
        'Date (dd-mm-yyyy)' => '18-07-2022'
      }
      columns['Phase'] = 1 if @project.timeline? # Only if there are phases in the project

      ignore_columns = %w[topic_ids idea_files_attributes idea_images_attributes]
      @project_fields.each do |field|
        next if field.input_type == 'section'
        next if ignore_columns.include? field.code

        columns[field.code] = 'test'
      end

      columns['Image URL'] = 'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/people_in_meeting_graphic.png'
      columns['Topics'] = 'Mobility; Health and welfare'

      # binding.pry

      XlsxService.new.hash_array_to_xlsx [columns]
    end

    # parsed_docs is the output from google form parser
    def paper_docs_to_idea_rows(parsed_docs)
      parsed_docs.map do |doc|
        idea_row = {}
        idea_row[:project_id] = @project.id
        ## TODO: This won't currently allow for Title, Body, Email or Name to appear multiple times
        idea_row[:title_multiloc] = { @locale.to_sym => find_field(doc, 'Title:')[:value] }
        idea_row[:body_multiloc] = { @locale.to_sym => find_field(doc, 'Body:')[:value] }
        idea_row[:user_email] = find_field(doc, 'Email:')[:value]
        idea_row[:user_name] = find_field(doc, 'Name:')[:value]
        idea_row[:custom_field_values] = process_custom_fields(doc)
        idea_row
      end
    end

    # Match custom fields by the text of their label in the specified locale
    # Do this lookup for all fields, not just custom?
    def process_custom_fields(doc)
      participation_method = Factory.instance.participation_method_for(@project)
      custom_form = @project.custom_form || participation_method.create_default_form!

      # Get the keys for the field/option names in the import locale
      text_field_types = %w[text multiline_text]
      select_field_types = %w[select multiselect]
      text_fields = []
      select_options = []
      IdeaCustomFieldsService.new(custom_form).all_fields.each do |field|
        if text_field_types.include? field[:input_type]
          text_fields << { name: field[:title_multiloc][@locale], key: field[:key] }
        elsif select_field_types.include? field[:input_type]
          field.options.each do |option|
            select_options << { name: option[:title_multiloc][@locale], key: option[:key], field_key: field[:key], field_type: field[:input_type] }
          end
        end
      end

      custom_fields = {}

      # Text fields
      text_fields.each do |field|
        text_field = find_field(doc, field[:name])
        if text_field
          custom_fields[field[:key].to_sym] = text_field[:value]
          # Remove fields from the doc once they have been added
          # so they don't get confused with later fields with same name
          # and TODO: we can also display back any unmatched fields
          doc.delete_if { |f| f == text_field }
        end
      end

      # Select fields
      # As we don't have a title for each select question we
      # loop through options in order they appear on the form and
      # remove so that fields with the same values don't get picked up
      select_options.each do |option|

        option_field = find_field(doc, option[:name])
        if option_field && option_field[:type].include?('checkbox')
          field_key = option[:field_key].to_sym
          checked = option_field[:type] == 'filled_checkbox'
          if option[:field_type] == 'multiselect' && checked
            custom_fields[field_key] = custom_fields[field_key] || []
            custom_fields[field_key] << option[:key]
          elsif checked && !custom_fields[field_key]
            # Only use the first selected option for a single select
            custom_fields[field_key] = option[:key]
          end
          doc.delete_if { |f| f == option_field }
        end
      end

      custom_fields
    end

    def find_field(doc, name)
      doc.find { |f| f[:name] == name }
    end
  end
end
