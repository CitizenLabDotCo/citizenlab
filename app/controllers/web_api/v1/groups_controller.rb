class WebApi::V1::GroupsController < ApplicationController

  before_action :set_group, only: [:show, :update, :destroy]

  def index
    @groups = policy_scope(Group)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    @groups = @groups.where(membership_type: params[:membership_type]) if params[:membership_type]
    
  	render json: @groups
  end

  def show
    render json: @group, serializer: WebApi::V1::GroupSerializer
  end

  def by_slug
    @group = Group.find_by!(slug: params[:slug])
    authorize @group
    show
  end

  # insert
  def create
    @group = Group.new(group_params)
    authorize @group
    SideFxGroupService.new.before_create(@group, current_user)
    if @group.save
      SideFxGroupService.new.after_create(@group, current_user)
      render json: @group.reload, status: :created
    else
      render json: { errors: @group.errors.details }, status: :unprocessable_entity
    end
  end

  # patch
  def update
    SideFxGroupService.new.before_update(@group, current_user)
    if @group.update(group_params)
      SideFxGroupService.new.after_update(@group, current_user)
      render json: @group.reload, status: :ok
    else
      render json: { errors: @group.errors.details }, status: :unprocessable_entity
    end
  end

  # delete
  def destroy
    SideFxGroupService.new.before_destroy(@group, current_user)
    group = @group.destroy
    if group.destroyed?
      SideFxGroupService.new.after_destroy(@group, current_user)
      head :ok
    else
      head 500
    end
  end

  def set_group
    @group = Group.find params[:id]
    authorize @group
  end

  def group_params
    params.require(:group).permit(
      :membership_type, 
      title_multiloc: I18n.available_locales,
      rules: [:ruleType, :customFieldId, :predicate, :value]
    )
  end

end
