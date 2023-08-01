# frozen_string_literal: true
require "google/cloud/vision"

# https://github.com/weg-li/weg-li/blob/9261e1eecbb6bb6eb16393fe99126b9563ce78f5/app/lib/annotator.rb#L4
class WebApi::V1::HandwrittenIdeasController < ApplicationController
  skip_before_action :authenticate_user, only: %i[create]
  skip_after_action :verify_authorized
  skip_after_action :verify_policy_scoped

  def create
    locale = params[:idea][:locale]

    request = {
      requests: [
        {
          image: {
            content: Base64.decode64(
              remove_data_url_prefix(params[:idea][:image])
            )
          },
          image_context: {
            language_hints: [locale]
          },
          features: [
            { type: "DOCUMENT_TEXT_DETECTION", model: 'builtin/latest' }
          ]
        }
      ]
    }

    response = image_annotator.batch_annotate_images(request)
    # render json: raw_json({ google_response: response.responses.first.to_h[:text_annotations][0] })

    idea_text = response.responses.first.to_h[:text_annotations][0][:description]
    idea_title = idea_text[0..20]

    title_multiloc = {}
    title_multiloc[locale] = idea_title

    body_multiloc = {}
    body_multiloc[locale] = idea_text

    project = Project.find(params[:idea][:project_id])
    author = current_user

    ## TODO image?

    idea_attributes = {}
    idea_attributes[:title_multiloc] = title_multiloc
    idea_attributes[:body_multiloc] = body_multiloc
    idea_attributes[:project] = project
    idea_attributes[:author] = author
    idea_attributes[:publication_status] = 'published'

    idea = Idea.new idea_attributes

    save_options = {}
    save_options[:context] = :publication

    ActiveRecord::Base.transaction do
      if idea.save save_options
        render json: WebApi::V1::IdeaSerializer.new(
          idea.reload,
          params: jsonapi_serializer_params,
          include: %i[author topics user_reaction idea_images]
        ).serializable_hash, status: :ok
      else
        render json: { errors: input.errors.details }, status: :unprocessable_entity
      end
    end
  end

  private

  def image_annotator
    @image_annotator ||= Google::Cloud::Vision.image_annotator
  end

  def remove_data_url_prefix(data_url)
    data_url.gsub("data:image/jpeg;base64,", "")
  end
end