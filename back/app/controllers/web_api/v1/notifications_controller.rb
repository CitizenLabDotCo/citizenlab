class WebApi::V1::NotificationsController < ApplicationController

  before_action :set_notification, only: [:show, :mark_read]
  before_action do
    self.namespace_for_serializer = WebApi::V1::Notifications
  end

  def index
    @notifications = policy_scope(Notification)
      .order(created_at: :desc)
      .includes(*include_load_resources)

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
      serializers: NotificationService.new.serializers
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
        serializers: NotificationService.new.serializers,
        ).serialized_json
    else
      head 500
    end
  end

  def show
    render json: WebApi::V1::Notifications::NotificationSerializer.new(
      @notification,
      params: fastjson_params,
      serializers: NotificationService.new.serializers,
      ).serialized_json
  end

  def mark_read
    if @notification.update(read_at: Time.now)
      render json: WebApi::V1::Notifications::NotificationSerializer.new(
        @notification,
        params: fastjson_params,
        serializers: NotificationService.new.serializers,
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

  def include_load_resources
    [:recipient, :initiating_user, :post, :post_status, :comment, :project, :phase, :official_feedback, :spam_report, :invite]
  end

  def secure_controller?
    false
  end
end

WebApi::V1::NotificationsController.prepend_if_ee('FlagInappropriateContent::Patches::WebApi::V1::NotificationsController')
