# frozen_string_literal: true

class WebApi::V1::ProjectModeratorsController < ApplicationController
  before_action :do_authorize, except: :index
  before_action :set_moderator, only: %i[show destroy]
  skip_before_action :authenticate_user
  skip_after_action :verify_authorized, only: :users_search
  skip_after_action :verify_policy_scoped, only: :index

  Moderator = Struct.new(:user_id, :project_id) do
    def self.policy_class
      ProjectModeratorPolicy
    end
  end

  def index
    # TODO: something about authorize index (e.g. user_id nastiness)
    authorize Moderator.new(nil, params[:project_id])
    @moderators = User.project_moderator(params[:project_id])
    @moderators = paginate @moderators

    render json: linked_json(@moderators, ::WebApi::V1::UserSerializer, params: jsonapi_serializer_params)
  end

  def show
    render json: ::WebApi::V1::UserSerializer.new(@moderator, params: jsonapi_serializer_params).serializable_hash
  end

  # insert
  def create
    @user = find_or_invite_user
    
    if @user.is_a?(InvitesImport)
      # User doesn't exist, invite was sent
      render json: raw_json({ status: 'invited' })
    else
      # User exists, add role
      @user.add_role 'project_moderator', project_id: params[:project_id]
      if @user.save
        ::SideFxUserService.new.after_update(@user, current_user)
        render json: raw_json({ status: 'role_added' })
      else
        render json: { errors: @user.errors.details }, status: :unprocessable_entity
      end
    end
  end

  # delete
  def destroy
    @moderator.delete_role 'project_moderator', project_id: params[:project_id]
    if @moderator.save
      ::SideFxUserService.new.after_update(@moderator, current_user)
      head :ok
    else
      head :internal_server_error
    end
  end

  def users_search
    authorize Moderator.new(nil, params[:project_id])
    @users = ::User.search_by_all(params[:search])
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    render json: linked_json(
      @users,
      ::WebApi::V1::ProjectModeratorSerializer,
      params: jsonapi_serializer_params(project_id: params[:project_id])
    )
  end

  private

  def set_moderator
    @moderator = User.find params[:id]
  end

  def create_moderator_params
    params.require(:moderator).permit(:user_id, :user_email)
  end

  def find_or_invite_user
    if create_moderator_params[:user_id].present?
      ::User.find(create_moderator_params[:user_id])
    elsif create_moderator_params[:user_email].present?
      email = create_moderator_params[:user_email]
      user = ::User.find_by(email: email)
      
      if user
        user
      else
        # User doesn't exist, send invite
        send_moderator_invite(email)
      end
    else
      raise ActiveRecord::RecordNotFound, 'Must provide either user_id or user_email'
    end
  end

  def send_moderator_invite(email)
    import = InvitesImport.create!(
      job_type: 'bulk_create',
      importer: current_user
    )

    invite_params = {
      emails: [email],
      roles: [{ type: 'project_moderator', project_id: params[:project_id] }],
      locale: current_user.locale || AppConfiguration.instance.settings('core', 'locales').first,
      invite_text: nil, # Optional: add custom invite text
      group_ids: []
    }

    ::Invites::BulkCreateJob.perform_later(
      current_user,
      invite_params,
      import.id,
      xlsx_import: false
    )

    import
  end

  def do_authorize
    authorize Moderator.new(params[:id], params[:project_id])
  end
end
