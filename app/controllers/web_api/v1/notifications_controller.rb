class WebApi::V1::NotificationsController < ApplicationController
  # This mapping is needed to serialize a collection (of notifications) of different types.

  before_action :set_notification, only: [:show, :mark_read]
  before_action do
    self.namespace_for_serializer = WebApi::V1::Notifications
  end

  def index
    @notifications = policy_scope(Notification)
      .order(created_at: :desc)
      .includes(:recipient, :initiating_user, :post, :post_status, :comment, :project, :phase, :official_feedback, :spam_report, :invite)

    if params[:only_unread]
      @notifications = @notifications.where(read_at: nil)
    end

    @notifications = @notifications
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))
    render json: linked_json(
      @notifications,
      WebApi::V1::Notifications::NotificationSerializer,
      params: fastjson_params,
      serializers: NotificationToSerializerMapper.map
      )
  end

  def mark_all_read
    authorize Notification
    @notifications = policy_scope(Notification)
      .where(read_at: nil)
    ids = @notifications.map(&:id)

    if @notifications.update_all(read_at: Time.now)
      render json: WebApi::V1::Notifications::NotificationSerializer.new(
        Notification.find(ids),
        params: fastjson_params,
        serializers: NotificationToSerializerMapper.map,
        ).serialized_json
    else
      head 500
    end
  end

  def show
    render json: WebApi::V1::Notifications::NotificationSerializer.new(
      @notification,
      params: fastjson_params,
      serializers: NotificationToSerializerMapper.map,
      ).serialized_json
  end

  def mark_read
    if @notification.update(read_at: Time.now)
      render json: WebApi::V1::Notifications::NotificationSerializer.new(
        @notification,
        params: fastjson_params,
        serializers: NotificationToSerializerMapper.map,
        ).serialized_json, status: :ok
    else
      head 500
    end
  end

  private

  def set_notification
    @notification = Notification.find(params[:id])
    authorize @notification
  end

  def secure_controller?
    false
  end
end
