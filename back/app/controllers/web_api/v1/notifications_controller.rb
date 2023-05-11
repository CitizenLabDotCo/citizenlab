# frozen_string_literal: true

class WebApi::V1::NotificationsController < ApplicationController
  before_action :set_notification, only: %i[show mark_read]
  before_action do
    self.namespace_for_serializer = WebApi::V1::Notifications
  end
  skip_before_action :authenticate_user

  def index
    @notifications = policy_scope(Notification)
      .order(created_at: :desc)
      .includes(*include_load_resources)

    if params[:only_unread]
      @notifications = @notifications.where(read_at: nil)
    end

    @notifications = paginate @notifications
    render json: { data: serialize_heterogeneous_collection(@notifications), links: page_links(@notifications) }
  end

  def mark_all_read
    authorize Notification
    @notifications = policy_scope(Notification)
      .where(read_at: nil)
    ids = @notifications.map(&:id)

    if @notifications.update_all(read_at: Time.now)
      render json: { data: serialize_heterogeneous_collection(Notification.find(ids)) }
    else
      head :internal_server_error
    end
  end

  def show
    render json: { data: serialize_by_type(@notification) }
  end

  def mark_read
    if @notification.update(read_at: Time.now)
      render json: { data: serialize_by_type(@notification) }, status: :ok
    else
      head :internal_server_error
    end
  end

  private

  def set_notification
    @notification = Notification.find(params[:id])
    authorize @notification
  end

  def include_load_resources
    %i[recipient initiating_user post post_status comment project phase official_feedback spam_report invite]
  end
end

WebApi::V1::NotificationsController.prepend(FlagInappropriateContent::Patches::WebApi::V1::NotificationsController)
