# frozen_string_literal: true

module BulkImportIdeas
  class ImportProjectIdeasService < ImportIdeasService

    def initialize(project_id)
      @project = Project.find(project_id)
      @project_fields = IdeaCustomFieldsService.new(Factory.instance.participation_method_for(@project).custom_form).enabled_fields
      super()
    end

    def generate_example_xlsx
      columns = {
        'ID' => '1',
        'Locale' => 'en',
        'Email' => 'moderator@citizenlab.co',
        'Date (dd-mm-yyyy)' => '18-07-2022',
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

      binding.pry

      XlsxService.new.hash_array_to_xlsx [columns]
    end
  end
end
