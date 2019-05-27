class WebApi::V1::InitiativesController < ApplicationController

  before_action :set_initiative, only: [:show, :update, :destroy]
  skip_after_action :verify_authorized, only: [:index_xlsx, :index_initiative_markers]
  
  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized
  
  def index
    @initiatives = policy_scope(Initiative).includes(:author)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    # TODO Generalize post filters?
    @initiatives = @initiatives.where(author_id: params[:author]) if params[:author].present?
    if params[:publication_status].present?
      @initiatives = @initiatives.where(publication_status: params[:publication_status])
    else
      @initiatives = @initiatives.where(publication_status: 'published')
    end

    @initiative_ids = @initiatives.map(&:id)

    if current_user
      votes = Vote.where(user: current_user, votable_id: @initiative_ids, votable_type: 'Initiative')
      votes_by_idea_id = votes.map{|vote| [vote.votable_id, vote]}.to_h
      render json: @initiatives, include: ['author', 'user_vote'], vbii: votes_by_idea_id
    else
      render json: @initiatives, include: ['author']
    end
  end

  def index_initiative_markers
    @initiatives = policy_scope(Initiative)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    # TODO Generalize post filters?
    @initiatives = @initiatives.where(author_id: params[:author]) if params[:author].present?
    if params[:publication_status].present?
      @initiatives = @initiatives.where(publication_status: params[:publication_status])
    else
      @initiatives = @initiatives.where(publication_status: 'published')
    end

    @initiatives = @initiatives.with_bounding_box(params[:bounding_box]) if params[:bounding_box].present?

    render json: @initiatives, each_serializer: WebApi::V1::PostMarkerSerializer
  end

  def show
    render json: @initiative, include: ['author','user_vote'], serializer: WebApi::V1::InitiativeSerializer
  end

  def by_slug
    @initiative = Initiative.find_by!(slug: params[:slug])
    authorize @initiative
    show
  end

  def create
    service = SideFxInitiativeService.new

    @initiative = Initiative.new(permitted_attributes(Initiative))
    @initiative.author ||= current_user

    service.before_create(@initiative, current_user)

    authorize @initiative
    ActiveRecord::Base.transaction do
      if @initiative.save
        service.after_create(@initiative, current_user)
        render json: @initiative.reload, status: :created, include: ['author','user_vote']
      else
        render json: { errors: @initiative.errors.details }, status: :unprocessable_entity
      end

    end
  end

  def update
    service = SideFxInitiativeService.new

    @initiative.assign_attributes(permitted_attributes(@initiative))
    authorize @initiative

    service.before_update(@initiative, current_user)
    ActiveRecord::Base.transaction do
      if @initiative.save
        authorize @initiative
        service.after_update(@initiative, current_user)
        render json: @initiative.reload, status: :ok, include: ['author','user_vote']
      else
        render json: { errors: @initiative.errors.details }, status: :unprocessable_entity
      end
    end 
  end

  def destroy
    service = SideFxInitiativeService.new
    
    service.before_destroy(@initiative, current_user)
    initiative = @initiative.destroy
    if initiative.destroyed?
      service.after_destroy(initiative, current_user)
      head :ok
    else
      head 500
    end
  end


  private

  def secure_controller?
    false
  end

  def set_initiative
    @initiative = Initiative.find params[:id]
    authorize @initiative
  end

end
