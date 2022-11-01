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

    def initialize
      @all_projects = Project.all
      @all_topics = Topic.all
    end

    def import_ideas(idea_rows, max_ideas: DEFAULT_MAX_IDEAS)
      raise Error.new 'bulk_import_ideas_maximum_ideas_exceeded', value: max_ideas if idea_rows.size > max_ideas

      ActiveRecord::Base.transaction do
        idea_rows.each do |idea_row|
          idea = import_idea idea_row
          Rails.logger.info { "Created #{idea.id}" }
        end
      end

      DumpTenantJob.perform_later Tenant.current
    end

    def generate_example_xlsx
      XlsxService.new.hash_array_to_xlsx [
        {
          'ID' => '1',
          'Title_nl-BE' => 'Mijn idee titel',
          'Title_fr-BE' => 'Mon idée titre',
          'Body_nl-BE' => 'Mijn idee inhoud',
          'Body_fr-BE' => 'Mon idée contenu',
          'Email' => 'moderator@citizenlab.co',
          'Project' => 'Project 1',
          'Phase' => 1,
          'Image URL' => 'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/people_in_meeting_graphic.png',
          'Date (dd-mm-yyyy)' => '18-07-2022',
          'Topics' => 'Mobility; Health and welfare',
          'Latitude' => 50.5035,
          'Longitude' => 6.0944,
          'Location Description' => 'Panorama sur les Hautes Fagnes / Hohes Venn'
        }
      ]
    end

    def xlsx_to_idea_rows(xlsx)
      xlsx.map do |xlsx_row|
        idea_row = {}

        title_multiloc = {}
        body_multiloc  = {}
        xlsx_row.each do |key, value|
          next unless key.include? '_'

          field, locale = key.split '_'
          case field
          when 'Title'
            title_multiloc[locale] = value
          when 'Body'
            body_multiloc[locale] = value
          end
        end

        idea_row[:title_multiloc]       = title_multiloc
        idea_row[:body_multiloc]        = body_multiloc
        idea_row[:topic_titles]         = (xlsx_row['Topics'] || '').split(';').map(&:strip).select(&:present?)
        idea_row[:project_title]        = xlsx_row['Project']
        idea_row[:user_email]           = xlsx_row['Email']
        idea_row[:image_url]            = xlsx_row['Image URL']
        idea_row[:phase_rank]           = xlsx_row['Phase']
        idea_row[:published_at]         = xlsx_row['Date (dd-mm-yyyy)']
        idea_row[:latitude]             = xlsx_row['Latitude']
        idea_row[:longitude]            = xlsx_row['Longitude']
        idea_row[:location_description] = xlsx_row['Location Description']
        idea_row[:id]                   = xlsx_row['ID']
        idea_row
      end
    end

    private

    attr_reader :all_projects, :all_topics

    def import_idea(idea_row)
      idea_attributes = {}
      add_title_multiloc idea_row, idea_attributes
      add_body_multiloc idea_row, idea_attributes
      add_project idea_row, idea_attributes
      add_author idea_row, idea_attributes
      add_published_at idea_row, idea_attributes
      add_publication_status idea_row, idea_attributes
      add_location idea_row, idea_attributes
      add_phase idea_row, idea_attributes
      add_topics idea_row, idea_attributes

      idea = Idea.new idea_attributes
      raise Error.new 'bulk_import_ideas_idea_not_valid', value: idea.errors.messages unless idea.valid?

      idea.save!

      create_idea_image idea_row, idea

      idea
    end

    def add_title_multiloc(idea_row, idea_attributes)
      raise Error.new 'bulk_import_ideas_blank_title', row: idea_row[:id] if idea_row[:title_multiloc].blank?

      idea_attributes[:title_multiloc] = idea_row[:title_multiloc]
    end

    def add_body_multiloc(idea_row, idea_attributes)
      raise Error.new 'bulk_import_ideas_blank_body', row: idea_row[:id] if idea_row[:body_multiloc].blank?

      idea_attributes[:body_multiloc] = idea_row[:body_multiloc]
    end

    def add_project(idea_row, idea_attributes)
      raise Error.new 'bulk_import_ideas_blank_project', row: idea_row[:id] if idea_row[:project_title].blank?

      project_title = idea_row[:project_title].downcase.strip
      project = all_projects.find do |find_project|
        find_project
          .title_multiloc
          .values
          .map { |title| title.downcase.strip }
          .include? project_title
      end
      unless project
        raise Error.new 'bulk_import_ideas_project_not_found', value: idea_row[:project_title], row: idea_row[:id]
      end

      idea_attributes[:project] = project
    end

    def add_author(idea_row, idea_attributes)
      raise Error.new 'bulk_import_ideas_blank_email', row: idea_row[:id] if idea_row[:user_email].blank?

      author = User.find_by_cimail idea_row[:user_email]
      raise Error.new 'bulk_import_ideas_email_not_found', value: idea_row[:user_email], row: idea_row[:id] unless author

      idea_attributes[:author] = author
    end

    def add_published_at(idea_row, idea_attributes)
      return if idea_row[:published_at].blank?

      if idea_row[:published_at].acts_like? :date
        idea_attributes[:published_at] = idea_row[:published_at]
        return
      end

      published_at = nil
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
      idea_attributes[:publication_status] = 'published'
    end

    def add_location(idea_row, idea_attributes)
      idea_attributes[:location_description] = idea_row[:location_description] if idea_row[:location_description]

      return if idea_row[:latitude].blank? && idea_row[:longitude].blank?

      if idea_row[:latitude].blank? || idea_row[:longitude].blank?
        raise Error.new 'bulk_import_ideas_location_point_blank_coordinate', value: "(#{idea_row[:latitude]}, #{idea_row[:longitude]})", row: idea_row[:id]
      end

      lat = nil
      lon = nil
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
      return if idea_row[:phase_rank].blank?

      phase_rank = nil
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

    def create_idea_image(idea_row, idea)
      return if idea_row[:image_url].blank?

      begin
        IdeaImage.create!(remote_image_url: idea_row[:image_url], idea: idea)
      rescue StandardError => _e
        raise Error.new 'bulk_import_ideas_image_url_not_valid', value: idea_row[:image_url], row: idea_row[:id]
      end
    end
  end
end
