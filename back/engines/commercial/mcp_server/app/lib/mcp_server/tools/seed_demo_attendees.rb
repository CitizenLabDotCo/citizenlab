# frozen_string_literal: true

class McpServer::Tools::SeedDemoAttendees < McpServer::BaseTool
  MAX_ATTENDEES_PER_CALL = 50

  def name = 'seed_demo_attendees'

  def annotations
    {
      read_only_hint: false,
      destructive_hint: false,
      idempotent_hint: false,
      open_world_hint: false
    }
  end

  def description
    <<~DESC.squish
      Seeds event registrations from generated fake demo users: pass event_id to fill one
      event, or project_id to spread the attendees over the project's events. Registrations
      are backdated to before the event starts and respect maximum_attendees. Attendance
      counts update accordingly. Only available on demo and trial platforms.
      Max #{MAX_ATTENDEES_PER_CALL} attendees per call; call repeatedly for more.
    DESC
  end

  def input_schema
    {
      properties: {
        event_id: { type: 'string', description: 'The ID of the event to register attendees for.' },
        project_id: { type: 'string', description: 'The ID of a project, to spread attendees over its events.' },
        count: {
          type: 'integer',
          minimum: 1,
          maximum: MAX_ATTENDEES_PER_CALL,
          description: 'Number of demo attendees to create.'
        }
      },
      required: %w[count],
      additionalProperties: false
    }
  end

  class Runner < McpServer::BaseTool::Runner
    DEMO_ONLY_MESSAGE = 'Demo attendees can only be created on demo and trial platforms.'

    def run
      return error('Pass exactly one of event_id or project_id.') unless [params[:event_id], params[:project_id]].compact.size == 1
      return error(DEMO_ONLY_MESSAGE) unless published_writable_platform?

      if params[:event_id]
        event = Event.find_by(id: params[:event_id])
        return not_found_error('Event', params[:event_id]) unless event

        events = [event]
      else
        project = Project.find_by(id: params[:project_id])
        return not_found_error('Project', params[:project_id]) unless project

        events = project.events.to_a
        return error('The project has no events.') if events.empty?
      end

      ceiling_message = McpServer::DemoData.user_ceiling_error_message(params[:count])
      return error(ceiling_message) if ceiling_message

      authorize(events.first.project, :update?)

      ActiveRecord::Base.transaction do
        create_attendances!(events)
      end

      response(
        "Created #{params[:count]} demo event registrations",
        structured: { attendances_count: params[:count] }
      )
    rescue ActiveRecord::RecordInvalid => e
      invalid_record_error(e.record)
    end

    private

    def create_attendances!(events)
      remaining = events.index_with { |event| event.maximum_attendees && (event.maximum_attendees - event.attendees_count) }
      candidates = events.select { |event| remaining[event].nil? || remaining[event].positive? }

      params[:count].times do
        # A full-only pool falls through to the model's maximum_attendees validation
        # (reload: counter_culture bumps the DB count, not our in-memory instance).
        event = candidates.sample || events.first.reload
        time = registration_time(event)

        author = McpServer::DemoData.build_author(time - rand(72).hours)
        author.save!
        Events::Attendance.create!(event: event, attendee: author, created_at: time)

        next unless remaining[event]

        remaining[event] -= 1
        candidates.delete(event) unless remaining[event].positive?
      end
    end

    def registration_time(event)
      to = [event.start_at, Time.zone.now].min.clamp(event.created_at..)
      Faker::Time.between(from: event.created_at, to: to)
    end
  end
end
