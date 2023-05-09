# frozen_string_literal: true

class WebApi::V1::GroupsController < ApplicationController
  before_action :set_group, only: %i[show update destroy]

  def index
    @groups = policy_scope(Group)
    @groups = @groups.where(membership_type: params[:membership_type]) if params[:membership_type]
    @groups = @groups.order_new
    @groups = paginate @groups
    render json: linked_json(@groups, WebApi::V1::GroupSerializer, params: fastjson_params)
  end

  def show
    render json: WebApi::V1::GroupSerializer.new(@group, params: fastjson_params).serializable_hash.to_json
  end

  def by_slug
    @group = Group.find_by!(slug: params[:slug])
    authorize @group
    show
  end

  # insert
  def create
    @group = Group.new
    @group.assign_attributes group_params
    authorize @group
    SideFxGroupService.new.before_create(@group, current_user)
    if @group.save
      SideFxGroupService.new.after_create(@group, current_user)
      render json: WebApi::V1::GroupSerializer.new(
        @group.reload,
        params: fastjson_params
      ).serializable_hash.to_json, status: :created
    else
      render json: { errors: @group.errors.details }, status: :unprocessable_entity
    end
  end

  # patch
  def update
    @group.assign_attributes group_params
    authorize @group
    SideFxGroupService.new.before_update(@group, current_user)
    if @group.save
      SideFxGroupService.new.after_update(@group, current_user)
      render json: WebApi::V1::GroupSerializer.new(
        @group.reload,
        params: fastjson_params
      ).serializable_hash.to_json, status: :ok
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
      head :internal_server_error
    end
  end

  def set_group
    @group = Group.find params[:id]
    authorize @group
  end

  def group_params
    permitted_attributes(@group)
  end
end
