class LogActivityJob < ApplicationJob
  include SideFxHelper
  queue_as :default

  attr_reader :item, :action, :user, :acted_at, :options, :activity

  def run(item, action, user, acted_at = Time.zone.now, options = {})
    @item     = item
    @action   = action
    @user     = user
    @acted_at = Time.zone.at(acted_at)
    @options  = options

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
    activity.action   = action
    activity.user     = user
    activity.acted_at = acted_at
    activity.payload  = options[:payload] || {}
    activity.save!
  end

  def trigger_notifications
    Notification.classes_for(activity).each do |notification_class|
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
