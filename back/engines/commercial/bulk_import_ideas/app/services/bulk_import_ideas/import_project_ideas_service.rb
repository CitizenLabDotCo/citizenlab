# frozen_string_literal: true

module BulkImportIdeas
  class ImportProjectIdeasService < ImportIdeasService
    def initialize(project_id, locale)
      @project = Project.find(project_id)
      @project_fields = IdeaCustomFieldsService.new(Factory.instance.participation_method_for(@project).custom_form).enabled_fields
      @locale = locale # TODO: Initialise with default locale for the platform
      super()
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
        idea_row[:title_multiloc] = { @locale.to_sym => doc['Title:'][:value] }
        idea_row[:body_multiloc] = { @locale.to_sym => doc['Body:'][:value] }
        idea_row[:user_email] = doc['Email:'][:value]
        idea_row[:user_name] = doc['Name:'][:value]
        idea_row[:custom_field_values] = add_custom_fields(doc)
        idea_row
        # TODO: Custom fields
      end
    end

    # Do this lookup for all fields, not just custom
    def add_custom_fields(doc)
      participation_method = Factory.instance.participation_method_for(@project)
      custom_form = @project.custom_form || participation_method.create_default_form!

      custom_fields = {}

      # Text fields
      text_fields = IdeaCustomFieldsService.new(custom_form).all_fields.filter_map do |field|
        next unless field[:input_type] == 'text'

        { name: field[:title_multiloc][@locale], key: field[:key] }
      end
      text_fields.each do |field|
        custom_fields[field[:key].to_sym] = doc[field[:name]][:value] if doc[field[:name]]
      end

      # TODO: Remove fields from the doc once they have been added
      # idea_row[:custom_something] if field['']
      # doc.each do |field|
      #
      #
      #   # binding.pry
      # end

      custom_fields
    end
  end
end
