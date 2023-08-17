# frozen_string_literal: true

module BulkImportIdeas
  class ImportProjectIdeasService < ImportIdeasService
    def initialize(current_user, project_id, locale, phase_id)
      super(current_user)
      @project = Project.find(project_id)
      # TODO: Find phase in project - not globally
      # project.phases.find do |phase|
      #       phase.start_at <= date && phase.end_at >= date
      #     end
      @phase = phase_id ? Phase.find(phase_id) : TimelineService.new.current_phase(@project)
      @form_fields = IdeaCustomFieldsService.new(Factory.instance.participation_method_for(@phase || @project).custom_form).enabled_fields
      @locale = locale || @locale
      # TODO: Document how locale works
    end

    def generate_example_xlsx
      # TODO: Translations for these columns?
      columns = {
        'Full name' => 'Bill Test',
        'Email address' => 'bill@citizenlab.co',
        'Date Published (dd-mm-yyyy)' => '18-07-2022'
      }

      ignore_columns = %w[idea_files_attributes idea_images_attributes]
      @form_fields.each do |field|
        next if field.input_type == 'section' || field.input_type == 'page' || ignore_columns.include?(field.code)

        column_name = field.title_multiloc[@locale]
        value = case field.input_type

        # TODO: Add other field types
        when 'select'
          field.options.first.title_multiloc[@locale]
        when 'multiselect'
          field.options.map { |o| o.title_multiloc[@locale] }.join '; '
        when 'topic_ids'
          @project.allowed_input_topics.map { |t| t.title_multiloc[@locale] }.join '; '
        else
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
        end
        columns[column_name] = value
      end

      columns['Image URL'] = 'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/people_in_meeting_graphic.png'
      columns['Latitude'] = 50.5035
      columns['Longitude'] = 6.0944
      columns['Location Description'] = 'Panorama sur les Hautes Fagnes / Hohes Venn'

      XlsxService.new.hash_array_to_xlsx [columns]
    end

    # parsed_docs is the output from google form parser
    def pdf_to_idea_rows(parsed_docs)
      parsed_docs.map do |doc|
        idea_row = {}
        idea_row[:pages] = doc.pluck(:page).uniq
        idea_row[:project_id] = @project.id
        idea_row[:phase_id] = @phase.id if @phase
        idea_row[:user_name] = find_field(doc, 'Full name')[:value]
        idea_row[:user_email] = find_field(doc, 'Email address')[:value]

        # TODO: This won't currently allow for Email address or Full Name to appear multiple times
        # TODO: Ensure find_field [:value] copes with nulls
        idea_row = process_custom_form_fields(doc, idea_row)
        idea_row
      end
    end

    def xlsx_to_idea_rows(xlsx)
      xlsx.map do |xlsx_row|
        idea_row = {}
        idea_row[:project_id]           = @project.id
        idea_row[:phase_id]             = @phase.id if @phase
        idea_row[:user_name]            = xlsx_row['Full name']
        idea_row[:user_email]           = xlsx_row['Email address']
        idea_row[:published_at]         = xlsx_row['Date Published (dd-mm-yyyy)']
        idea_row[:image_url]            = xlsx_row['Image URL']
        idea_row[:latitude]             = xlsx_row['Latitude']
        idea_row[:longitude]            = xlsx_row['Longitude']
        idea_row[:location_description] = xlsx_row['Location Description']

        # TODO: Add custom fields in here by refactoring process_custom_fields()
        # Could just add another way of doing option based fields to the same function?
        # All the following fields should also be done by the custom form mapping
        idea_row[:title_multiloc] = { @locale.to_sym => xlsx_row['Title'] }
        idea_row[:body_multiloc] = { @locale.to_sym => xlsx_row['Description'] }
        idea_row[:topic_titles] = (xlsx_row['Tags'] || '').split(';').map(&:strip).select(&:present?)

        # TODO: Convert xlsx row into the same format as doc or vice versa
        # idea_row = process_custom_form_fields(doc, idea_row)

        idea_row
      end
    end

    # Match all fields in the custom field by the text of their label in the specified locale
    def process_custom_form_fields(doc, idea_row)
      # Get the keys for the field/option names in the import locale
      core_field_codes = %w[title_multiloc body_multiloc location_description]
      text_field_types = %w[text multiline_text number]
      select_field_types = %w[select multiselect]
      core_fields = []
      text_fields = []
      select_options = []
      @form_fields.each do |field|
        if core_field_codes.include? field[:code]
          core_fields << { name: field[:title_multiloc][@locale], code: field[:code], type: field[:input_type] }
        elsif text_field_types.include? field[:input_type]
          text_fields << { name: field[:title_multiloc][@locale], key: field[:key], type: field[:input_type] }
        elsif select_field_types.include? field[:input_type]
          field.options.each do |option|
            select_options << { name: option[:title_multiloc][@locale], key: option[:key], field_key: field[:key], field_type: field[:input_type] }
          end
        end
      end

      # Core fields
      core_fields.each do |field|
        core_field = find_field(doc, field[:name])
        if core_field
          code = field[:code]
          value = core_field[:value]
          idea_row[code.to_sym] = field[:type].include?('multiloc') ? { @locale.to_sym => value } : value
          doc.delete_if { |f| f == core_field }
        end
      end

      # Custom fields
      custom_fields = {}

      # Text & Number fields
      text_fields.each do |field|
        text_field = find_field(doc, field[:name])
        if text_field
          custom_fields[field[:key].to_sym] = field[:type] == 'number' ? text_field[:value].to_i : text_field[:value]
          # Remove fields from the doc once they have been added
          # so they don't get confused with any later fields/options with same name
          # and TODO: we can also display back any unmatched fields
          doc.delete_if { |f| f == text_field }
        end
      end

      # Select fields - For PDF import
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

      # Select fields for xlsx import - we have the title so done differently
      # TODO

      idea_row[:custom_field_values] = custom_fields
      idea_row
    end

    def find_field(doc, name)
      doc.find { |f| f[:name] == name }
    end
  end
end
