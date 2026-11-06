# frozen_string_literal: true

module AIAssistant
  module Surfaces
    # Drafts a new project with the user, one approved step at a time.
    class ProjectGenerator < Surface
      # A date without a time, or with a time zone, can show in the draft as another day than the one that gets saved.
      DATE_FORMAT = '%Y-%m-%dT%H:%M:%S'

      def self.key
        'project_generator'
      end

      def self.subject_class
        Project
      end

      def available?
        subject.admin_publication.draft?
      end

      def project_id
        subject.id
      end

      def tools
        @tools ||= [
          Tool.new(McpServer::Tools::ListAreas),
          Tool.new(McpServer::Tools::ListGlobalTopics),
          Tool.new(McpServer::Tools::ListGroups),
          Tool.new(McpServer::Tools::ListPhasePermissions, allow: ->(args) { own_phase?(args['phase_id']) }),
          Tool.new(McpServer::Tools::GetResource, allow: ->(args) { own_project_phase_or_event?(args['type'], args['id']) }),
          # The administrator sets the header image and the folder in the project settings.
          # No screen shows location tracking, so nobody would notice the assistant turning it on.
          Tool.new(McpServer::Tools::UpdateProject, pinned: { project_id: subject.id }, omit: %w[remote_header_bg_url folder_id track_participation_location]),
          Tool.new(McpServer::Tools::CreatePhase, pinned: { project_id: subject.id }),
          Tool.new(McpServer::Tools::UpdatePhase, allow: ->(args) { own_phase?(args['phase_id']) }),
          # The draft can't explain these two: one is a list of ids, the other a point on a map.
          Tool.new(McpServer::Tools::UpdatePhasePermission, allow: ->(args) { own_phase?(args['phase_id']) }, omit: %w[demographic_questions]),
          Tool.new(McpServer::Tools::CreateEvent, pinned: { project_id: subject.id }, omit: %w[location_point_geojson]),
          Tool.new(McpServer::Tools::UpdateResource, allow: ->(args) { args['type'] == 'event' && own_event?(args['id']) }),
          Tool.new(McpServer::Tools::DestroyResource, allow: ->(args) { own_phase_or_event?(args['resource_type'], args['id']) })
        ]
      end

      def write_call_error(_tool, _conversation, arguments)
        map_location_error(arguments) || date_error(arguments)
      end

      private

      # update_resource nests its fields, so this one can't be omitted from the tool.
      def map_location_error(arguments)
        return unless arguments['attributes'].to_h.key?('location_point_geojson')

        'The administrator sets the point on the map in the project settings.'
      end

      def date_error(arguments)
        dates = arguments.merge(arguments['attributes'].to_h).slice('start_at', 'end_at').values.compact
        return if dates.all? { |date| date_time?(date) }

        'Write start_at and end_at as a date and a time without a time zone, like 2026-11-30T23:59:00.'
      end

      def date_time?(value)
        DateTime.strptime(value.to_s, DATE_FORMAT).strftime(DATE_FORMAT) == value
      rescue Date::Error
        false
      end

      def own_phase?(id)
        subject.phases.exists?(id:)
      end

      def own_event?(id)
        subject.events.exists?(id:)
      end

      def own_phase_or_event?(resource_type, id)
        case resource_type
        when 'phase' then own_phase?(id)
        when 'event' then own_event?(id)
        else false
        end
      end

      def own_project_phase_or_event?(resource_type, id)
        return id == subject.id if resource_type == 'project'

        own_phase_or_event?(resource_type, id)
      end

      def surface_prompt(locale:)
        ::Analysis::LLM::Prompt.new.fetch(
          'ai_assistant_project_generator',
          locale:,
          today: Time.current.in_time_zone(AppConfiguration.timezone).to_date.iso8601,
          platform_locales: AppConfiguration.instance.settings('core', 'locales'),
          draft: JSON.pretty_generate(draft(locale))
        )
      end

      # So the model also sees changes made outside the chat.
      def draft(locale)
        multiloc_service = MultilocService.new
        {
          project: {
            title: multiloc_service.t(subject.title_multiloc, locale),
            description_preview: multiloc_service.t(subject.description_preview_multiloc, locale),
            visible_to: subject.visible_to,
            group_ids: subject.group_ids,
            listed: subject.listed,
            include_all_areas: subject.include_all_areas,
            area_ids: subject.area_ids,
            global_topic_ids: subject.global_topic_ids
          },
          phases: subject.phases.map do |phase|
            {
              id: phase.id,
              title: multiloc_service.t(phase.title_multiloc, locale),
              participation_method: phase.participation_method,
              start_at: phase.start_at,
              end_at: phase.end_at
            }
          end,
          events: subject.events.map do |event|
            { id: event.id, title: multiloc_service.t(event.title_multiloc, locale), start_at: event.start_at, end_at: event.end_at }
          end
        }
      end
    end
  end
end
