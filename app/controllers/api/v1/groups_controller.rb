class Api::V1::GroupsController < ApplicationController

  before_action :set_group, only: [:show, :update, :destroy]

  def index
    @groups = policy_scope(Group)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))
  	render json: @groups
  end

  def show
    render json: @group, serializer: Api::V1::GroupSerializer
  end

  def by_slug
    @group = Group.find_by!(slug: params[:slug])
    authorize @group
    show
  end

  # insert
  def create
    @group = Group.new(permitted_attributes(Group))
    authorize @group
    if @group.save
      render json: @group.reload, status: :created # also include?
    else
      render json: { errors: @group.errors.details }, status: :unprocessable_entity
    end
  end

  # patch
  def update
    if @group.update(permitted_attributes(Group))
      render json: @group.reload, status: :ok
    else
      render json: { errors: @group.errors.details }, status: :unprocessable_entity
    end
  end

  # delete
  def destroy
    group = @group.destroy
    if group.destroyed?
      head :ok
    else
      head 500
    end
  end

  def set_group
    @group = Group.find params[:id]
    authorize @group
  end

end
