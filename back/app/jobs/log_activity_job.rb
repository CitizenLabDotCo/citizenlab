# frozen_string_literal: true

class LogActivityJob < ApplicationJob
  include SideFxHelper
  queue_as :default

  attr_reader :item, :action, :user, :acted_at, :options, :activity

  rescue_from(ActiveJob::DeserializationError) do |exception|
    # It would be great if we could match exception.clause.id to the item_id
    # or user_id, but those arguments do not seem to be available.
    Rails.logger.warn "Job item or user was probably deleted while the job was queued: #{exception.message}"
  end

  def initialize(*args)
    # The `project_id` is automatically derived from the `item` and added to the
    # `options` hash (see `LogActivityJob#run`). This is done in the constructor because
    # it needs to happen before the job serialization. Otherwise, it would not be
    # feasible to determine the `project_id` for deleted items.
    item, action, user, acted_at, options = args

    if options.to_h.key?(:project_id) || (project_id = item.try(:project_id)).nil?
      super(*args)
    else
      new_options = options.to_h.merge(project_id: project_id)
      super(item, action, user, acted_at, new_options)
    end
  end

  def run(item, action, user, acted_at = nil, options = {})
    @item = item
    @action = action
    @user = user
    @acted_at = Time.zone.at(acted_at || Time.zone.now)
    @options = options

    do_run
  end

  private

  def do_run
    instantiate_activity
    save_activity
    trigger_notifications
    trigger_campaigns
    publish_activity_to_rabbit
    trigger_track_activity_job
  end

  def instantiate_activity
    @activity = if item.is_a? String
      # when e.g. the item has been destroyed, the class and id must be
      # retrieved by encoding and decoding to a string
      claz, id = decode_frozen_resource(item)
      Activity.new(item_type: claz.name, item_id: id)
    else
      # item.class.name is needed for polymorphic subclasses like Notification
      # descendants
      Activity.new(item: item, item_type: item.class.name)
    end
  end

  def save_activity
    activity.action = action
    activity.user = user
    activity.acted_at = acted_at
    activity.payload = options[:payload] || {}
    activity.project_id = options[:project_id]
    activity.save!
  end

  def trigger_notifications
    NotificationService.new.classes_for(activity).each do |notification_class|
      MakeNotificationsForClassJob.perform_later(notification_class.name, activity)
    end
  end

  def trigger_campaigns
    EmailCampaigns::TriggerOnActivityJob.perform_later(activity)
  end

  def publish_activity_to_rabbit
    PublishActivityToRabbitJob.perform_later(activity)
  end

  def trigger_track_activity_job
    # We're no longer logging notifications to segment, as there are mass
    # notifications that count as segment's monthly active users, which is too
    # expensive
    TrackEventJob.perform_later(activity) unless item.is_a?(Notification)
  end
end
