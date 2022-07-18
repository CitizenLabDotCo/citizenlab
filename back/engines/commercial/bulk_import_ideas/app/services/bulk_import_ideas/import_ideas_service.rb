# frozen_string_literal: true

module BulkImportIdeas
  class Error < StandardError; end

  class ImportIdeasService
    DEFAULT_MAX_IDEAS = 500

    def import_ideas(idea_rows, max_ideas: DEFAULT_MAX_IDEAS)
      raise Error, "The maximal amount of #{max_ideas} ideas has been exceeded" if idea_rows.size > max_ideas

      ActiveRecord::Base.transaction do
        idea_rows.each do |idea_row|
          idea = import_idea idea_row
          Rails.logger.info { "Created #{idea.id}" }
        end
      end
    end

    def generate_example_xlsx
      XlsxService.new.hash_array_to_xlsx [
        {
          'Title_nl-BE' => 'Mijn idee titel',
          'Title_fr-BE' => 'Mon idée titre',
          'Body_nl-BE' => 'Mijn idee inhoud',
          'Body_fr-BE' => 'Mon idée contenu',
          'Email' => 'moderator@citizenlab.co',
          'Project' => 'Project 1',
          'Phase' => 1,
          'Image URL' => 'https://res.cloudinary.com/citizenlabco/image/upload/v1548847594/image_v8imrf.png',
          'Date (dd-mm-yyyy)' => '2022-07-18',
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
        idea_row[:topic_titles]         = (csv_idea['Topics'] || '').split(';').map(&:strip).select { |topic| topic }
        idea_row[:project_title]        = csv_idea['Project']
        idea_row[:user_email]           = csv_idea['Email']
        idea_row[:image_url]            = csv_idea['Image URL']
        idea_row[:phase_rank]           = csv_idea['Phase']
        idea_row[:published_at]         = csv_idea['Date (dd-mm-yyyy)']
        idea_row[:latitude]             = csv_idea['Latitude']
        idea_row[:longitude]            = csv_idea['Longitude']
        idea_row[:location_description] = csv_idea['Location Description']
        idea_row
      end
    end

    private

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
      # Later iteration: parseable error using idea.errors.details
      raise Error, "The resulting idea is not valid: #{idea.errors.messages}" unless idea.valid?

      idea.save!

      create_idea_image idea_row, idea

      idea
    end

    def add_title_multiloc(idea_row, idea_attributes)
      raise Error, 'Idea with empty title' if idea_row[:title_multiloc].blank?

      idea_attributes[:title_multiloc] = idea_row[:title_multiloc]
    end

    def add_body_multiloc(idea_row, idea_attributes)
      raise Error, 'Idea with empty body' if idea_row[:body_multiloc].blank?

      idea_attributes[:body_multiloc] = idea_row[:body_multiloc]
    end

    def add_project(idea_row, idea_attributes)
      raise Error, 'Idea without project' if idea_row[:project_title].blank?

      project_title = idea_row[:project_title].downcase.strip
      # Later iteration: Only load necessary attributes? Preload all projects before importing all?
      project = Project.all.find do |find_project|
        find_project
          .title_multiloc
          .values
          .map { |v| v.downcase.strip }
          .include? project_title
      end
      raise Error, "No project with title \"#{idea_row[:project_title]}\" exists" if project.blank?

      idea_attributes[:project] = project
    end

    def add_author(idea_row, idea_attributes)
      raise Error, 'Idea without user email' if idea_row[:user_email].blank?

      author = User.find_by_cimail idea_row[:user_email]
      raise Error, "No user exists with email \"#{idea_row[:user_email]}\"" if author.blank?

      idea_attributes[:author] = author
    end

    def add_published_at(idea_row, idea_attributes)
      return if idea_row[:published_at].blank?

      published_at = nil
      begin
        published_at = Date.parse idea_row[:published_at]
      rescue StandardError => _e
        raise Error, "Idea with invalid publication date format \"#{idea_row[:published_at]}\""
      end

      idea_attributes[:published_at] = published_at
    end

    def add_publication_status(_idea_row, idea_attributes)
      idea_attributes[:publication_status] = 'published'
    end

    def add_location(idea_row, idea_attributes)
      if (lat = idea_row[:latitude]&.to_f) && (lon = idea_row[:longitude]&.to_f)
        location_point = {
          'type' => 'Point',
          'coordinates' => [lon, lat]
        }
        idea_attributes[:location_point_geojson] = location_point
      end
      idea_attributes[:location_description] = idea_row[:location_description] if idea_row[:location_description]
    end

    def add_phase(idea_row, idea_attributes)
      return if idea_row[:phase_rank].blank?

      phase_rank = idea_row[:phase_rank].to_i
      project_phases = Phase.where(project: idea_attributes[:project])
      if phase_rank > project_phases.size
        raise Error, "There are only #{project_phases.size} phases in project \"#{idea_row[:project_title]}\" (requested phase: #{phase_rank})"
      end

      phase = project_phases.order(:start_at).all[phase_rank - 1]
      raise Error, "No phase #{phase_rank} found in project \"#{idea_row[:project_title]}\"" if phase.blank?

      idea_attributes[:phases] = [phase]
    end

    def add_topics(idea_row, idea_attributes)
      idea_row[:topic_titles] ||= []
      topics_ids = idea_row[:topic_titles].map do |topic_title|
        topic_title = topic_title.downcase.strip
        # Later iteration: Only load necessary attributes? Preload all topics before importing all?
        Topic.all.find do |topic|
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
        raise Error, "No image could be downloaded from #{idea_row[:image_url]}, make sure the URL is valid and ends with a file extension such as .png or .jpg"
      end
    end
  end
end
