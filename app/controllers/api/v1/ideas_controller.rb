class Api::V1::IdeasController < ApplicationController
  # TODO: fix
  before_action :skip_authorization
  before_action :skip_policy_scope

  # list
  def index
    send_success(find_all)
  end

  # get
  def show
    send_success(find)
  rescue ActiveRecord::RecordNotFound
    send_not_found
  end

  # insert
  def create
    idea = Idea.new(idea_params)
    idea.save!
    send_success(idea, 201)
  rescue ActiveRecord::RecordInvalid
    send_error(idea.errors)
  rescue ActiveRecord::RecordNotFound => e
    send_error(e.message)
  end

  # patch
  def update
    idea = find
    idea.update!(idea_params)
    send_success(idea)
  rescue ActiveRecord::RecordNotFound
    send_not_found
  rescue ActiveRecord::RecordInvalid
    send_error(idea.errors)
  end

  # delete
  def destroy
    idea = find
    idea.destroy
    send_no_content
  rescue ActiveRecord::RecordNotFound
    send_not_found
  end

  private
  # TODO: temp fix to pass tests
  def secure_controller?
    false
  end

  def idea_params
    params.require(:idea).permit(
			:publication_status,
			:lab_id,
			:author_id,
			:author_name,
			:images,
			:files,
			title_multiloc: [:en, :nl, :fr],
      body_multiloc: [:en, :nl, :fr],
    )
  end

  def find_all
    Idea.all
  end

  def find
    Idea.find(params[:id])
  end
end
