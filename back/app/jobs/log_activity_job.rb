# frozen_string_literal: true

class LogActivityJob < ApplicationJob
  include SideFxHelper
  queue_as :default

  rescue_from(ActiveJob::DeserializationError) do |exception|
    # Do not report any error if the item or user was deleted while the job was queued
    error_serialized_id = exception.cause.is_a?(ActiveRecord::RecordNotFound) && exception.cause.id
    item_and_user = [@serialized_arguments[0], @serialized_arguments[2]]
    item_and_user_ids = item_and_user.filter_map do |obj|
      if obj.is_a?(Hash)
        URI(obj.values.first).path.split('/').last
      else
        false
      end
    end
    if error_serialized_id && item_and_user_ids.include?(error_serialized_id)
      Rails.logger.warn "Job item or user was probably deleted while the job was queued: #{exception.message}"
    else
      raise
    end
  end

  def initialize(*args)
    # The `project_id` is automatically derived from the `item` and added to the
    # `options` hash (see `LogActivityJob#run`). This is done in the constructor because
    # it needs to happen before the job serialization. Otherwise, it would not be
    # feasible to determine the `project_id` for deleted items.
    item, action, user, acted_at, options = args

    if options.to_h.key?(:project_id) || (project_id = item.try(:project_id)).nil?
      super
    else
      new_options = options.to_h.merge(project_id: project_id)
      super(item, action, user, acted_at, new_options)
    end
  end

  def run(item, action, user, acted_at = nil, options = {})
    activity = create_activity(item, action, user, acted_at, options)
    trigger_notifications(activity)
    trigger_campaigns(activity)
    trigger_webhooks(activity)
    publish_activity_to_rabbit(activity)
    trigger_track_activity_job(activity, item)
  end

  private

  def create_activity(item, action, user, acted_at, options = {})
    attrs = {
      action: action,
      user: user,
      acted_at: Time.zone.at(acted_at || Time.zone.now),
      payload: options[:payload] || {},
      project_id: options[:project_id]
    }
    if item.is_a?(String)
      # when e.g. the item has been destroyed, the class and id must be
      # retrieved by encoding and decoding to a string
      attrs[:item_type], attrs[:item_id] = decode_frozen_resource(item)
    else
      attrs[:item] = item
      # item.class.name is needed for polymorphic subclasses like Notification
      # descendants
      attrs[:item_type] = item.class.name
    end
    Activity.create!(attrs)
  end

  def trigger_notifications(activity)
    NotificationService.new.classes_for(activity).each do |notification_class|
      MakeNotificationsForClassJob.perform_later(notification_class.name, activity)
    end
  end

  def trigger_campaigns(activity)
    EmailCampaigns::TriggerOnActivityJob.perform_later(activity)
  end

  def trigger_webhooks(activity)
    # Optimization: Skip if no webhooks are enabled. This avoids overhead for
    # the common case where no webhooks are configured
    return unless Webhooks::Subscription.any_enabled?

    Webhooks::EnqueueService.new.call(activity)
  end

  def publish_activity_to_rabbit(activity)
    PublishActivityToRabbitJob.perform_later(activity)
  end

  def trigger_track_activity_job(activity, original_item)
    # We're no longer logging notifications to segment, as there are mass
    # notifications that count as segment's monthly active users, which is too
    # expensive
    TrackEventJob.perform_later(activity) unless original_item.is_a?(Notification)
  end
end
