# frozen_string_literal: true

module BulkImportIdeas::Importers
  class IdeaImporter < BaseImporter
    DEFAULT_MAX_IDEAS = 5000
    DATE_FORMAT_REGEX = /^(0[1-9]|[1|2][0-9]|3[0|1])-(0[1-9]|1[0-2])-([0-9]{4})$/ # After https://stackoverflow.com/a/47218282/3585671

    def import(idea_rows)
      raise BulkImportIdeas::Error.new 'bulk_import_maximum_ideas_exceeded', value: DEFAULT_MAX_IDEAS if idea_rows.size > DEFAULT_MAX_IDEAS

      ideas = []
      ActiveRecord::Base.transaction do
        ideas = idea_rows.map do |idea_row|
          idea = import_idea idea_row
          idea
        end
      end

      ideas
    end

    private

    def import_idea(idea_row)
      idea_attributes = {}
      add_title_multiloc idea_row, idea_attributes
      add_body_multiloc idea_row, idea_attributes
      add_project idea_row, idea_attributes
      add_published_at idea_row, idea_attributes
      add_publication_status idea_row, idea_attributes
      add_location idea_row, idea_attributes
      add_phase idea_row, idea_attributes
      add_input_topics idea_row, idea_attributes
      add_custom_fields idea_row, idea_attributes
      user_created = add_author idea_row, idea_attributes

      idea = Idea.new idea_attributes
      idea.slug ||= SecureRandom.uuid if !idea.valid? # Support importing draft ideas without title
      raise BulkImportIdeas::Error.new 'bulk_import_idea_not_valid', value: idea.errors.messages unless idea.valid?

      idea.save!

      create_idea_image idea_row, idea
      create_idea_import idea, user_created, idea_row[:user_consent], idea_row[:pdf_pages], idea_row[:file]

      idea
    end

    def add_title_multiloc(idea_row, idea_attributes)
      title = idea_row[:title_multiloc] || {}
      idea_attributes[:title_multiloc] = title
    end

    def add_body_multiloc(idea_row, idea_attributes)
      body = idea_row[:body_multiloc] || {}
      idea_attributes[:body_multiloc] = body
    end

    def add_project(idea_row, idea_attributes)
      if idea_row[:project_id]
        project = Project.find(idea_row[:project_id])
      else
        project_title = idea_row[:project_title].downcase.strip
        project = Project.all.find do |find_project|
          find_project
            .title_multiloc
            .values
            .map { |title| title.downcase.strip }
            .include? project_title
        end
      end

      idea_attributes[:project] = project
    end

    def add_author(idea_row, idea_attributes)
      author = nil
      if idea_row[:user_email].present? || idea_row[:user_first_name].present?
        author = idea_row[:user_email].present? ? User.find_by_cimail(idea_row[:user_email]) : nil
        unless author
          user_params = {
            locale: @locale,
            first_name: idea_row[:user_first_name],
            last_name: idea_row[:user_last_name],
            email: idea_row[:user_email]
          }
          author = UserService.build_in_input_importer(user_params)
          if author.save
            @imported_users << author
          else
            author = nil
          end
        end
      end

      idea_attributes[:author] = author
      @imported_users.include? author # Was the user created in this import
    end

    def add_published_at(idea_row, idea_attributes)
      return if idea_row[:published_at].blank?

      begin
        published_at = idea_row[:published_at].acts_like?(:date) ? idea_row[:published_at] : DateTime.parse(idea_row[:published_at])
        published_at = date_with_time published_at
      rescue StandardError => _e
        raise BulkImportIdeas::Error.new(
          'bulk_import_publication_date_invalid_format',
          value: idea_row[:published_at],
          row: idea_row[:id]
        )
      end

      # Set both published_at and submitted_at to the same value
      idea_attributes[:published_at] = published_at
      idea_attributes[:submitted_at] = published_at
    end

    # Add the current time to the date to ensure consistent sorting by published_at date
    def date_with_time(published_date)
      current_time = Time.now
      published_date.change(
        hour: current_time.hour,
        min: current_time.min,
        sec: current_time.sec,
        usec: current_time.usec
      )
    end

    def add_publication_status(_idea_row, idea_attributes)
      idea_attributes[:publication_status] = 'draft'
    end

    def add_location(idea_row, idea_attributes)
      idea_attributes[:location_description] = idea_row[:location_description] if idea_row[:location_description]

      return if idea_row[:latitude].blank? && idea_row[:longitude].blank?

      if idea_row[:latitude].blank? || idea_row[:longitude].blank?
        raise BulkImportIdeas::Error.new 'bulk_import_location_point_blank_coordinate', value: "(#{idea_row[:latitude]}, #{idea_row[:longitude]})", row: idea_row[:id]
      end

      begin
        lat = Float idea_row[:latitude]
        lon = Float idea_row[:longitude]
      rescue ArgumentError => _e
        raise BulkImportIdeas::Error.new 'bulk_import_location_point_non_numeric_coordinate', value: "(#{idea_row[:latitude]}, #{idea_row[:longitude]})", row: idea_row[:id]
      end

      location_point = {
        'type' => 'Point',
        'coordinates' => [lon, lat]
      }
      idea_attributes[:location_point_geojson] = location_point
    end

    def add_phase(idea_row, idea_attributes)
      return unless idea_row[:phase_id]

      phase = Phase.find(idea_row[:phase_id])
      idea_attributes[:creation_phase_id] = phase.id if !phase.pmethod.transitive?
      idea_attributes[:phases] = [phase]
    end

    def add_input_topics(idea_row, idea_attributes)
      idea_row[:topic_titles] ||= []
      input_topics_ids = idea_row[:topic_titles].map do |topic_title|
        topic_title = topic_title.downcase.strip
        idea_attributes[:project].input_topics.find do |topic|
          topic
            .title_multiloc
            .values
            .map(&:downcase)
            .include? topic_title
        end
      end.compact_blank.map(&:id).uniq

      idea_attributes[:input_topic_ids] = input_topics_ids
    end

    def add_custom_fields(idea_row, idea_attributes)
      idea_attributes[:custom_field_values] = idea_row[:custom_field_values] || {}
    end

    def create_idea_image(idea_row, idea)
      return if idea_row[:image_url].blank?

      begin
        IdeaImage.create!(remote_image_url: idea_row[:image_url], idea: idea)
      rescue StandardError => _e
        raise BulkImportIdeas::Error.new 'bulk_import_image_url_not_valid', value: idea_row[:image_url], row: idea_row[:id]
      end
    end

    def create_idea_import(idea, user_created, user_consent, page_range, file)
      # Add import metadata
      idea_import = BulkImportIdeas::IdeaImport.new(
        idea: idea,
        page_range: page_range,
        import_user: @import_user,
        user_created: user_created,
        user_consent: user_consent || false,
        file: file,
        locale: @locale
      )
      idea_import.save!
    end
  end
end
