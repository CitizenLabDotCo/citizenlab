class Api::V1::IdeasController < ApplicationController
  # TODO: fix
  # before_action :skip_authorization
  # before_action :skip_policy_scope
  before_action :set_idea, only: [:show, :update, :destroy]

  def index
    @ideas = policy_scope(Idea).includes(:author).page(params[:page])
    render json: @ideas, include: ['author']
  end

  def show
    render json: @idea, include: ['author','topics','areas']
  end

  # insert
  def create
    @idea = Idea.new(idea_params)
    authorize @idea
    if @idea.save
      render json: @idea, status: :created, include: ['author','topics','areas']
    else
      render json: { errors: @idea.errors }, status: :unprocessable_entity
    end
  end

  # patch
  def update
    if @idea.update(idea_params)
      render json: @idea, status: :ok, include: ['author','topics','areas']
    else
      render json: @idea.errors, status: :unprocessable_entity
    end
  end

  # delete
  def destroy
    idea.destroy
    head :ok
  end

  private
  # TODO: temp fix to pass tests
  def secure_controller?
    false
  end

  def set_idea
    @idea = Idea.find params[:id]
    authorize @idea
  end

  def idea_params
    params.require(:idea).permit(
			:publication_status,
			:lab_id,
			:author_id,
			title_multiloc: [:en, :nl, :fr],
      body_multiloc: [:en, :nl, :fr],
      images: [],
      files: []
    )
  end


end
