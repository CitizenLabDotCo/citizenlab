class WebApi::V1::NotificationsController < ApplicationController

  MODEL_TO_SERIALIZER = { 
    Notifications::AdminRightsReceived             => WebApi::V1::Fast::Notifications::AdminRightsReceivedSerializer,
    Notifications::CommentDeletedByAdmin           => WebApi::V1::Fast::Notifications::CommentDeletedByAdminSerializer,
    Notifications::CommentMarkedAsSpam             => WebApi::V1::Fast::Notifications::CommentMarkedAsSpamSerializer,
    Notifications::CommentOnYourComment            => WebApi::V1::Fast::Notifications::CommentOnYourCommentSerializer,
    Notifications::CommentOnYourIdea               => WebApi::V1::Fast::Notifications::CommentOnYourIdeaSerializer,
    Notifications::IdeaAssignedToYou               => WebApi::V1::Fast::Notifications::IdeaAssignedToYouSerializer,
    Notifications::IdeaMarkedAsSpam                => WebApi::V1::Fast::Notifications::IdeaMarkedAsSpamSerializer,
    Notifications::InviteAccepted                  => WebApi::V1::Fast::Notifications::InviteAcceptedSerializer,
    Notifications::MentionInComment                => WebApi::V1::Fast::Notifications::MentionInCommentSerializer,
    Notifications::NewCommentForAdmin              => WebApi::V1::Fast::Notifications::NewCommentForAdminSerializer,
    Notifications::NewIdeaForAdmin                 => WebApi::V1::Fast::Notifications::NewIdeaForAdminSerializer,
    Notifications::OfficialFeedbackOnCommentedIdea => WebApi::V1::Fast::Notifications::OfficialFeedbackOnCommentedIdeaSerializer,
    Notifications::OfficialFeedbackOnVotedIdea     => WebApi::V1::Fast::Notifications::OfficialFeedbackOnVotedIdeaSerializer,
    Notifications::OfficialFeedbackOnYourIdea      => WebApi::V1::Fast::Notifications::OfficialFeedbackOnYourIdeaSerializer,
    Notifications::ProjectModerationRightsReceived => WebApi::V1::Fast::Notifications::ProjectModerationRightsReceivedSerializer,
    Notifications::ProjectPhaseStarted             => WebApi::V1::Fast::Notifications::ProjectPhaseStartedSerializer,
    Notifications::ProjectPhaseUpcoming            => WebApi::V1::Fast::Notifications::ProjectPhaseUpcomingSerializer,
    Notifications::StatusChangeOfYourIdea          => WebApi::V1::Fast::Notifications::StatusChangeOfYourIdeaSerializer
  }

  before_action :set_notification, only: [:show, :mark_read]
  before_action do
    self.namespace_for_serializer = WebApi::V1::Fast::Notifications
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

    render json: linked_json(
      @notifications, 
      WebApi::V1::Fast::Notifications::NotificationSerializer, 
      params: fastjson_params,
      serializers: MODEL_TO_SERIALIZER
      )
  end

  def mark_all_read
    authorize Notification
    @notifications = policy_scope(Notification)
      .where(read_at: nil)
    ids = @notifications.map(&:id)

    if @notifications.update_all(read_at: Time.now)
      render json: WebApi::V1::Fast::Notifications::NotificationSerializer.new(
        Notification.find(ids), 
        params: fastjson_params,
        serializers: MODEL_TO_SERIALIZER,
        ).serialized_json 
    else
      head 500
    end
  end

  def show
    render json: WebApi::V1::Fast::Notifications::NotificationSerializer.new(
      @notification, 
      params: fastjson_params,
      serializers: MODEL_TO_SERIALIZER,
      ).serialized_json
  end

  def mark_read
    if @notification.update(read_at: Time.now)
      render json: WebApi::V1::Fast::Notifications::NotificationSerializer.new(
        @notification, 
        params: fastjson_params,
        serializers: MODEL_TO_SERIALIZER,
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
