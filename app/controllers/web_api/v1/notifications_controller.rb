class WebApi::V1::NotificationsController < ApplicationController

  before_action :set_notification, only: [:show, :mark_read]
  before_action do
    self.namespace_for_serializer = WebApi::V1::Notifications
  end

  def index
    @notifications = policy_scope(Notification)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))
      .order(created_at: :desc)
      .includes(:recipient,:idea,:project)

    if params[:only_unread]
      @notifications = @notifications.where(read_at: nil)
    end

    render json: @notifications
  end

  def mark_all_read
    authorize Notification
    @notifications = policy_scope(Notification)
      .where(read_at: nil)
    ids = @notifications.map(&:id)

    if @notifications.update_all(read_at: Time.now)

      render json: Notification.find(ids)
    else
      head 500
    end
  end

  def show
    render json: @notification
  end

  def mark_read
    if @notification.update(read_at: Time.now)
      render json: @notification, status: :ok
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
