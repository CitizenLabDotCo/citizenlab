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

    # This rubbish actually works! Really not arguing we should do this, and almost certainly not in this controller
    # action, but it at least shows we can serialize the notifications without using the heterogenous serializer.
    collection = []

    @notifications.each do |notification|
      serializer_class = "WebApi::V1::#{notification.type}Serializer".constantize

      collection << JSON.parse(serializer_class.new(notification, params: fastjson_params).serializable_hash.to_json)['data']
    end

    @notifications = paginate @notifications

    render json: { data: collection, links: page_links(@notifications) }
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
        serializers: NotificationService.new.serializers
      ).serializable_hash.to_json
    else
      head :internal_server_error
    end
  end

  def show
    render json: WebApi::V1::Notifications::NotificationSerializer.new(
      @notification,
      params: fastjson_params,
      serializers: NotificationService.new.serializers
    ).serializable_hash.to_json
  end

  def mark_read
    if @notification.update(read_at: Time.now)
      render json: WebApi::V1::Notifications::NotificationSerializer.new(
        @notification,
        params: fastjson_params,
        serializers: NotificationService.new.serializers
      ).serializable_hash.to_json, status: :ok
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
