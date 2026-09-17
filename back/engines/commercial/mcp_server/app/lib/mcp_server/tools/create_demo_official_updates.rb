# frozen_string_literal: true

class McpServer::Tools::CreateDemoOfficialUpdates < McpServer::BaseTool
  MAX_UPDATES_PER_CALL = 50

  def name = 'create_demo_official_updates'

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
      Creates demo official updates (official feedback from the city) on inputs, backdated
      after the input they respond to. Write updates that fit the input's content. Meant
      for ideation and proposals inputs — survey responses have no public page to show
      updates on. Only available on demo and trial platforms.
      Max #{MAX_UPDATES_PER_CALL} updates per call.
    DESC
  end

  def input_schema
    {
      properties: {
        updates: {
          type: 'array',
          minItems: 1,
          maxItems: MAX_UPDATES_PER_CALL,
          items: {
            type: 'object',
            properties: {
              idea_id: { type: 'string', description: 'The ID of the input the update responds to.' },
              body_multiloc: { **multiloc_schema, description: 'Update body (HTML).' },
              author_multiloc: {
                **multiloc_schema,
                description: 'Display name the update is signed with, e.g. the responsible department. ' \
                             "Defaults to the platform's organization name."
              }
            },
            required: %w[idea_id body_multiloc],
            additionalProperties: false
          }
        }
      },
      required: %w[updates],
      additionalProperties: false
    }
  end

  class Runner < McpServer::BaseTool::Runner
    DEMO_ONLY_MESSAGE = 'Demo official updates can only be created on demo and trial platforms.'
    MAX_UPDATES_PER_IDEA = 5

    def run
      return error(DEMO_ONLY_MESSAGE) unless published_writable_platform?

      ideas = Idea.where(id: params[:updates].pluck(:idea_id)).index_by(&:id)
      missing_idea_id = params[:updates].pluck(:idea_id).find { |id| !ideas[id] }
      return not_found_error('Idea', missing_idea_id) if missing_idea_id

      requested = params[:updates].pluck(:idea_id).tally
      capped = ideas.values.find { |idea| idea.official_feedbacks_count + requested[idea.id] > MAX_UPDATES_PER_IDEA }
      if capped
        return error("Input #{capped.id} already has #{capped.official_feedbacks_count} official updates " \
                     "of max #{MAX_UPDATES_PER_IDEA}. Do not add more.")
      end

      updates = params[:updates].map { |attributes| build_update(attributes, ideas[attributes[:idea_id]]) }
      updates.each { |update| authorize(update, :create?) }

      errors = updates.each_with_index.filter_map do |update, index|
        { index:, errors: record_errors(update) } if update.invalid?
      end
      return error('Validation failed:', structured: { errors: }) if errors.any?

      ActiveRecord::Base.transaction { updates.each(&:save!) }

      response(
        "Created #{updates.size} demo official updates",
        structured: { official_feedback_ids: updates.map(&:id) }
      )
    rescue ActiveRecord::RecordInvalid => e
      invalid_record_error(e.record)
    end

    private

    def build_update(attributes, idea)
      time = Faker::Time.between(from: idea.created_at, to: Time.zone.now)
      OfficialFeedback.new(
        idea: idea,
        user: current_user,
        body_multiloc: attributes[:body_multiloc],
        author_multiloc: attributes[:author_multiloc] || AppConfiguration.instance.settings('core', 'organization_name'),
        created_at: time,
        # Rails would stamp updated_at "now", making a backdated update look freshly edited.
        updated_at: time
      )
    end
  end
end
