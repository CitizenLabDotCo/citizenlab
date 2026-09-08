# frozen_string_literal: true

class McpServer::Tools::CreateDemoComments < McpServer::BaseTool
  MAX_COMMENTS_PER_CALL = 50

  def name = 'create_demo_comments'

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
      Creates demo comments on inputs (ideas, proposals). Each comment gets a generated
      fake demo author and a backdated timestamp after the input it comments on. Only
      available on demo and trial platforms. Write comments that fit the input's content.
      For threaded replies, create the top-level comments first, then pass their returned
      IDs as parent_id in a second call. Max #{MAX_COMMENTS_PER_CALL} comments per call.
    DESC
  end

  def input_schema
    {
      properties: {
        comments: {
          type: 'array',
          minItems: 1,
          maxItems: MAX_COMMENTS_PER_CALL,
          items: {
            type: 'object',
            properties: {
              idea_id: { type: 'string', description: 'The ID of the input to comment on.' },
              body_multiloc: { **multiloc_schema, description: 'Comment body (HTML).' },
              parent_id: {
                type: 'string',
                description: 'ID of an existing comment on the same input, to create a threaded reply.'
              }
            },
            required: %w[idea_id body_multiloc],
            additionalProperties: false
          }
        }
      },
      required: %w[comments],
      additionalProperties: false
    }
  end

  class Runner < McpServer::BaseTool::Runner
    DEMO_ONLY_MESSAGE = 'Demo comments can only be created on demo and trial platforms.'

    def run
      return error(DEMO_ONLY_MESSAGE) unless published_writable_platform?

      ideas = Idea.where(id: params[:comments].pluck(:idea_id)).index_by(&:id)
      missing_idea_id = params[:comments].pluck(:idea_id).find { |id| !ideas[id] }
      return not_found_error('Idea', missing_idea_id) if missing_idea_id

      parents = Comment.where(id: params[:comments].pluck(:parent_id).compact).index_by(&:id)
      bad_parent = params[:comments].find do |attributes|
        attributes[:parent_id] && parents[attributes[:parent_id]]&.idea_id != attributes[:idea_id]
      end
      return not_found_error('Parent comment on the same input', bad_parent[:parent_id]) if bad_parent

      ceiling_message = McpServer::DemoData.user_ceiling_error_message(params[:comments].size)
      return error(ceiling_message) if ceiling_message

      comments = params[:comments].map do |attributes|
        build_comment(attributes, ideas[attributes[:idea_id]], parents[attributes[:parent_id]])
      end
      comments.each { |comment| authorize(comment, :create?) }

      errors = comments.each_with_index.filter_map do |comment, index|
        { index:, errors: record_errors(comment) } if comment.invalid?
      end
      return error('Validation failed:', structured: { errors: }) if errors.any?

      ActiveRecord::Base.transaction do
        comments.each do |comment|
          comment.author.save!
          comment.save!
        end
      end

      response(
        "Created #{comments.size} demo comments",
        structured: { comment_ids: comments.map(&:id) }
      )
    rescue ActiveRecord::RecordInvalid => e
      invalid_record_error(e.record)
    end

    private

    def build_comment(attributes, idea, parent)
      time = Faker::Time.between(from: [idea.created_at, parent&.created_at].compact.max, to: Time.zone.now)
      Comment.new(
        idea: idea,
        parent: parent,
        body_multiloc: attributes[:body_multiloc],
        author: McpServer::DemoData.build_author(time - rand(72).hours),
        created_at: time
      )
    end
  end
end
