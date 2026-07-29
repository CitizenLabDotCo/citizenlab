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
    # Derive project_id/channel here, at enqueue time in the request thread where Current
    # is still set — the job itself runs later on a worker with no request context.
    item, action, user, acted_at, options = args
    extra = extra_options(item, options)

    if extra.empty?
      super
    else
      super(item, action, user, acted_at, options.to_h.merge(extra))
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

  # The project_id/channel to merge into `options`, derived from the item and the current
  # request. Empty when both are already set or unavailable.
  def extra_options(item, options)
    options = options.to_h
    extra = {}

    unless options.key?(:project_id)
      project_id = item.try(:project_id)
      extra[:project_id] = project_id unless project_id.nil?
    end

    unless options.key?(:channel)
      channel = Current.activity_channel
      extra[:channel] = channel unless channel.nil?
    end

    extra
  end

  def create_activity(item, action, user, acted_at, options = {})
    attrs = {
      action: action,
      user: user,
      acted_at: Time.zone.at(acted_at || Time.zone.now),
      payload: options[:payload] || {},
      project_id: options[:project_id],
      channel: options[:channel]
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
