# frozen_string_literal: true

module BulkImportIdeas
  class ImportIdeasService
    DEFAULT_MAX_IDEAS = 500

    def import_ideas(idea_rows, max_ideas: DEFAULT_MAX_IDEAS)
      raise "The maximal amount of #{max_ideas} ideas has been exceeded" if idea_rows.size > max_ideas

      ActiveRecord::Base.transaction do
        idea_rows.each do |idea_row|
          idea = import_idea idea_row
          Rails.logger.info { "Created #{idea.id}" }
        end
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
      raise "The resulting idea is not valid: #{idea.errors.messages}" unless idea.valid?

      idea.save!

      create_idea_image idea_row, idea

      idea
    end

    def add_title_multiloc(idea_row, idea_attributes)
      raise 'Idea with empty title' if idea_row[:title_multiloc].blank?

      idea_attributes[:title_multiloc] = idea_row[:title_multiloc]
    end

    def add_body_multiloc(idea_row, idea_attributes)
      raise 'Idea with empty body' if idea_row[:body_multiloc].blank?

      idea_attributes[:body_multiloc] = idea_row[:body_multiloc]
    end

    def add_project(idea_row, idea_attributes)
      raise 'Idea without project' if idea_row[:project_title].blank?

      project_title = idea_row[:project_title].downcase.strip
      # Later iteration: Only load necessary attributes? Preload all projects before importing all?
      project = Project.all.find do |find_project|
        find_project
          .title_multiloc
          .values
          .map { |v| v.downcase.strip }
          .include? project_title
      end
      raise "No project with title #{idea_row[:project_title]} exists" if project.blank?

      idea_attributes[:project] = project
    end

    def add_author(idea_row, idea_attributes)
      raise 'Idea without user email' if idea_row[:user_email].blank?

      author = User.find_by_cimail idea_row[:user_email]
      raise "No user exists with email #{idea_row[:user_email]}" if author.blank?

      idea_attributes[:author] = author
    end

    def add_published_at(idea_row, idea_attributes)
      return if idea_row[:published_at].blank?

      published_at = nil
      begin
        published_at = Date.parse idea_row[:published_at]
      rescue StandardError => _e
        raise "Idea with invalid publication date format: #{idea_row[:published_at]}"
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

      phase_rank = idea_data[:phase_rank].to_i
      project_phases = Phase.where(project: idea_attributes[:project])
      if phase_rank > project_phases.size
        raise "There are only #{project_phases.size} phases in project #{idea_row[:project_title]} (requested phase: #{phase_rank})"
      end

      phase = project_phases.order(:start_at).all[phase_rank - 1]
      raise "No phase #{phase_rank} found in project #{idea_row[:project_title]}" if phase.blank?

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
      end.select(&:present?).uniq(&:id)

      idea_attributes[:topic_ids] = topics_ids
    end

    def create_idea_image(idea_row, idea)
      return if idea_row[:image_url].blank?

      begin
        IdeaImage.create!(remote_image_url: idea_row[:image_url], idea: idea)
      rescue StandardError => _e
        raise "No image could be downloaded from #{idea_row[:image_url]}, make sure the URL is valid and ends with a file extension such as .png or .jpg"
      end
    end
  end
end
