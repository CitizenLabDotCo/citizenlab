class WebApi::V1::NotificationsController < ApplicationController

  # This mapping is needed to serialize a collection (of notifications) of different types.
  MODEL_TO_SERIALIZER = { 
    ::Notifications::AdminRightsReceived             => WebApi::V1::Notifications::AdminRightsReceivedSerializer,
    ::Notifications::CommentDeletedByAdmin           => WebApi::V1::Notifications::CommentDeletedByAdminSerializer,
    ::Notifications::CommentMarkedAsSpam             => WebApi::V1::Notifications::CommentMarkedAsSpamSerializer,
    ::Notifications::CommentOnYourComment            => WebApi::V1::Notifications::CommentOnYourCommentSerializer,
    ::Notifications::CommentOnYourIdea               => WebApi::V1::Notifications::CommentOnYourIdeaSerializer,
    ::Notifications::IdeaAssignedToYou               => WebApi::V1::Notifications::IdeaAssignedToYouSerializer,
    ::Notifications::IdeaMarkedAsSpam                => WebApi::V1::Notifications::IdeaMarkedAsSpamSerializer,
    ::Notifications::InviteAccepted                  => WebApi::V1::Notifications::InviteAcceptedSerializer,
    ::Notifications::MentionInComment                => WebApi::V1::Notifications::MentionInCommentSerializer,
    ::Notifications::NewCommentForAdmin              => WebApi::V1::Notifications::NewCommentForAdminSerializer,
    ::Notifications::NewIdeaForAdmin                 => WebApi::V1::Notifications::NewIdeaForAdminSerializer,
    ::Notifications::OfficialFeedbackOnCommentedIdea => WebApi::V1::Notifications::OfficialFeedbackOnCommentedIdeaSerializer,
    ::Notifications::OfficialFeedbackOnVotedIdea     => WebApi::V1::Notifications::OfficialFeedbackOnVotedIdeaSerializer,
    ::Notifications::OfficialFeedbackOnYourIdea      => WebApi::V1::Notifications::OfficialFeedbackOnYourIdeaSerializer,
    ::Notifications::ProjectModerationRightsReceived => WebApi::V1::Notifications::ProjectModerationRightsReceivedSerializer,
    ::Notifications::ProjectPhaseStarted             => WebApi::V1::Notifications::ProjectPhaseStartedSerializer,
    ::Notifications::ProjectPhaseUpcoming            => WebApi::V1::Notifications::ProjectPhaseUpcomingSerializer,
    ::Notifications::StatusChangeOfYourIdea          => WebApi::V1::Notifications::StatusChangeOfYourIdeaSerializer
  }

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

    render json: linked_json(
      @notifications, 
      WebApi::V1::Notifications::NotificationSerializer, 
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
      render json: WebApi::V1::Notifications::NotificationSerializer.new(
        Notification.find(ids), 
        params: fastjson_params,
        serializers: MODEL_TO_SERIALIZER,
        ).serialized_json 
    else
      head 500
    end
  end

  def show
    render json: WebApi::V1::Notifications::NotificationSerializer.new(
      @notification, 
      params: fastjson_params,
      serializers: MODEL_TO_SERIALIZER,
      ).serialized_json
  end

  def mark_read
    if @notification.update(read_at: Time.now)
      render json: WebApi::V1::Notifications::NotificationSerializer.new(
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
