module WebApi
  module V1
    module Moderators
      class ModeratorsController < ApplicationController
        before_action :set_moderatable
        before_action :do_authorize
        before_action :set_moderator, only: %i[show destroy]

        skip_after_action :verify_policy_scoped, only: :index

        def index
          @moderators = paginate moderator_scope
          render json: linked_json(@moderators, ::WebApi::V1::UserSerializer, params: jsonapi_serializer_params)
        end

        def show
          render json: ::WebApi::V1::UserSerializer.new(@moderator, params: jsonapi_serializer_params).serializable_hash
        end

        def create
          @user = find_or_invite_user

          if @user.is_a?(InvitesImport)
            # User doesn't exist, invite was sent
            render json: raw_json({ status: 'invited' })
          else
            # User exists, add role
            @user.add_role role_type, **role_id_params
            if @user.save
              ::SideFxUserService.new.after_update(@user, current_user)
              render json: raw_json({ status: 'role_added' })
            else
              render json: { errors: @user.errors.details }, status: :unprocessable_entity
            end
          end
        end

        def destroy
          @moderator.delete_role role_type, **role_id_params

          if @moderator.save
            ::SideFxUserService.new.after_update(@moderator, current_user)
            head :ok
          else
            head :internal_server_error
          end
        end

        private

        def set_moderatable
          @moderatable = find_moderatable
        end

        def do_authorize
          authorize @moderatable, policy_class: moderator_policy_class
        end

        def set_moderator
          @moderator = User.find params[:id]
        end

        def create_moderator_params
          params.require(:moderator).permit(:user_id, :user_email)
        end

        def find_or_invite_user
          if create_moderator_params[:user_id].present?
            User.find(create_moderator_params[:user_id])
          elsif create_moderator_params[:user_email].present?
            email = create_moderator_params[:user_email]
            user = User.find_by(email: email)

            # If user doesn't exist, send invite
            user || send_moderator_invite(email)
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
            roles: [{ type: role_type, **role_id_params }],
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
      end
    end
  end
end
