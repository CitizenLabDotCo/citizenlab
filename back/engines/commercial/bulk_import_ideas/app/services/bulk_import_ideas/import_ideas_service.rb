# frozen_string_literal: true

module BulkImportIdeas
  class Error < StandardError
    def initialize(key, params = {})
      super()
      @key = key
      @params = params
    end

    attr_reader :key, :params
  end

  class ImportIdeasService
    DEFAULT_MAX_IDEAS = 500
    DATE_FORMAT_REGEX = /^(0[1-9]|[1|2][0-9]|3[0|1])-(0[1-9]|1[0-2])-([0-9]{4})$/ # After https://stackoverflow.com/a/47218282/3585671

    def initialize(current_user)
      @locale = AppConfiguration.instance.settings('core', 'locales').first # Default locale for any new users created
      @all_projects = Project.all
      @all_topics = Topic.all
      @import_user = current_user
      @project = nil
      @uploaded_file = nil
    end

    def import_file(file_content)
      files = create_files file_content

      ideas = []
      files.each do |file|
        idea_rows = parse_idea_rows file
        ideas += import_ideas(idea_rows, file)
      end
      ideas
    end

    def create_files(file_content)
      [upload_source_file(file_content)]
    end

    def import_ideas(idea_rows, file = nil)
      raise Error.new 'bulk_import_ideas_maximum_ideas_exceeded', value: DEFAULT_MAX_IDEAS if idea_rows.size > DEFAULT_MAX_IDEAS

      ideas = []
      ActiveRecord::Base.transaction do
        ideas = idea_rows.map do |idea_row|
          idea = import_idea idea_row, file
          Rails.logger.info { "Created #{idea.id}" }
          idea
        end
      end

      # To ensure the latest ideas are available in NLP stack
      DumpTenantJob.perform_later Tenant.current
      ideas
    end

    def parse_idea_rows(_file)
      []
    end

    def generate_example_xlsx
      nil
    end

    def import_as_draft?
      true
    end

    private

    attr_reader :all_projects, :all_topics

    def upload_source_file(file_content)
      file_type = file_content.index('application/pdf') ? 'pdf' : 'xlsx'
      IdeaImportFile.create!(
        import_type: file_type,
        project: @project,
        file_by_content: {
          name: "import.#{file_type}",
          content: file_content # base64
        }
      )
    end

    def parse_xlsx_ideas(file)
      xlsx_file = open(file.file_content_url)
      XlsxService.new.xlsx_to_hash_array xlsx_file
    end

    def import_idea(idea_row, file)
      idea_attributes = {}
      add_title_multiloc idea_row, idea_attributes
      add_body_multiloc idea_row, idea_attributes
      add_project idea_row, idea_attributes
      add_published_at idea_row, idea_attributes
      add_publication_status idea_row, idea_attributes
      add_location idea_row, idea_attributes
      add_phase idea_row, idea_attributes
      add_topics idea_row, idea_attributes
      add_custom_fields idea_row, idea_attributes
      user_created = add_author idea_row, idea_attributes

      idea = Idea.new idea_attributes
      raise Error.new 'bulk_import_ideas_idea_not_valid', value: idea.errors.messages unless idea.valid?

      idea.save!

      create_idea_image idea_row, idea
      create_idea_import idea, user_created, idea_row[:pdf_pages], file

      idea
    end

    def add_title_multiloc(idea_row, idea_attributes)
      raise Error.new 'bulk_import_ideas_blank_title', row: idea_row[:id] if idea_row[:title_multiloc].blank? && !import_as_draft?

      title = idea_row[:title_multiloc] || {}
      idea_attributes[:title_multiloc] = title
    end

    def add_body_multiloc(idea_row, idea_attributes)
      raise Error.new 'bulk_import_ideas_blank_body', row: idea_row[:id] if idea_row[:body_multiloc].blank? && !import_as_draft?

      body = idea_row[:body_multiloc] || {}
      idea_attributes[:body_multiloc] = body
    end

    def add_project(idea_row, idea_attributes)
      raise Error.new 'bulk_import_ideas_blank_project', row: idea_row[:id] if idea_row[:project_title].blank? && idea_row[:project_id].blank?

      if idea_row[:project_id]
        project = Project.find(idea_row[:project_id])
      else
        project_title = idea_row[:project_title].downcase.strip
        project = all_projects.find do |find_project|
          find_project
            .title_multiloc
            .values
            .map { |title| title.downcase.strip }
            .include? project_title
        end
      end
      unless project
        raise Error.new 'bulk_import_ideas_project_not_found', value: idea_row[:project_title], row: idea_row[:id]
      end

      idea_attributes[:project] = project
    end

    def add_author(idea_row, idea_attributes)
      author = nil
      user_created = false

      if idea_row[:user_email].present?
        author = User.find_by_cimail idea_row[:user_email]
        unless author
          author = User.new(email: idea_row[:user_email], locale: @locale)
          author = add_author_name author, idea_row
          if author.save
            user_created = true
          else
            author = nil
          end
        end
      end

      unless author
        author = User.new(unique_code: SecureRandom.uuid, locale: @locale)
        author = add_author_name author, idea_row
        author.save!
        user_created = true
      end

      idea_attributes[:author] = author
      user_created
    end

    def add_author_name(author, idea_row)
      if idea_row[:user_name]
        name = idea_row[:user_name].split(' ', 2)
        author.first_name = name[0] if name[0].present?
        author.last_name = name[1] if name[1].present?
      end
      author
    end

    def add_published_at(idea_row, idea_attributes)
      return if idea_row[:published_at].blank?

      if idea_row[:published_at].acts_like? :date
        idea_attributes[:published_at] = idea_row[:published_at]
        return
      end

      invalid_date_error = Error.new(
        'bulk_import_ideas_publication_date_invalid_format',
        value: idea_row[:published_at],
        row: idea_row[:id]
      )
      raise invalid_date_error unless idea_row[:published_at].match? DATE_FORMAT_REGEX

      begin
        published_at = Date.parse idea_row[:published_at]
      rescue StandardError => _e
        raise invalid_date_error
      end

      idea_attributes[:published_at] = published_at
    end

    def add_publication_status(_idea_row, idea_attributes)
      idea_attributes[:publication_status] = import_as_draft? ? 'draft' : 'published'
    end

    def add_location(idea_row, idea_attributes)
      idea_attributes[:location_description] = idea_row[:location_description] if idea_row[:location_description]

      return if idea_row[:latitude].blank? && idea_row[:longitude].blank?

      if idea_row[:latitude].blank? || idea_row[:longitude].blank?
        raise Error.new 'bulk_import_ideas_location_point_blank_coordinate', value: "(#{idea_row[:latitude]}, #{idea_row[:longitude]})", row: idea_row[:id]
      end

      begin
        lat = Float idea_row[:latitude]
        lon = Float idea_row[:longitude]
      rescue ArgumentError => _e
        raise Error.new 'bulk_import_ideas_location_point_non_numeric_coordinate', value: "(#{idea_row[:latitude]}, #{idea_row[:longitude]})", row: idea_row[:id]
      end

      location_point = {
        'type' => 'Point',
        'coordinates' => [lon, lat]
      }
      idea_attributes[:location_point_geojson] = location_point
    end

    def add_phase(idea_row, idea_attributes)
      if idea_row[:phase_id]
        phase = Phase.find(idea_row[:phase_id])
        idea_attributes[:creation_phase_id] = phase.id if phase&.native_survey?
      else
        return if idea_row[:phase_rank].blank?

        begin
          phase_rank = Integer idea_row[:phase_rank]
        rescue ArgumentError => _e
          raise Error.new 'bulk_import_ideas_non_numeric_phase_rank', value: idea_row[:phase_rank], row: idea_row[:id]
        end

        project_phases = Phase.where(project: idea_attributes[:project])
        if phase_rank > project_phases.size
          raise Error.new 'bulk_import_ideas_maximum_phase_rank_exceeded', value: phase_rank, row: idea_row[:id]
        end

        phase = project_phases.order(:start_at).all[phase_rank - 1]
        raise Error.new 'bulk_import_ideas_project_phase_not_found', value: phase_rank, row: idea_row[:id] unless phase
      end

      idea_attributes[:phases] = [phase]
    end

    def add_topics(idea_row, idea_attributes)
      idea_row[:topic_titles] ||= []
      topics_ids = idea_row[:topic_titles].map do |topic_title|
        topic_title = topic_title.downcase.strip
        all_topics.find do |topic|
          topic
            .title_multiloc
            .values
            .map(&:downcase)
            .include? topic_title
        end
      end.select(&:present?).map(&:id).uniq

      idea_attributes[:topic_ids] = topics_ids
    end

    def add_custom_fields(idea_row, idea_attributes)
      idea_attributes[:custom_field_values] = idea_row[:custom_field_values] || {}
    end

    def create_idea_image(idea_row, idea)
      return if idea_row[:image_url].blank?

      begin
        IdeaImage.create!(remote_image_url: idea_row[:image_url], idea: idea)
      rescue StandardError => _e
        raise Error.new 'bulk_import_ideas_image_url_not_valid', value: idea_row[:image_url], row: idea_row[:id]
      end
    end

    def idea_blank?(idea)
      idea.each do |_field, value|
        return false if value.present?
      end
      true
    end

    def create_idea_import(idea, user_created, page_range, file)
      # Add import metadata
      idea_import = IdeaImport.new(
        idea: idea,
        page_range: page_range,
        import_user: @import_user,
        user_created: user_created,
        file: file,
        locale: @locale
      )
      idea_import.save!
    end
  end
end
