# frozen_string_literal: true

# == Schema Information
#
# Table name: moderation_moderations
#
#  id                     :uuid             primary key
#  moderatable_type       :text
#  post_type              :text
#  post_id                :uuid
#  post_slug              :string
#  post_title_multiloc    :jsonb
#  project_id             :uuid
#  project_slug           :string
#  project_title_multiloc :jsonb
#  content_title_multiloc :jsonb
#  content_body_multiloc  :jsonb
#  content_slug           :string
#  created_at             :datetime
#  moderation_status      :string
#
module Moderation
  class Moderation < ApplicationRecord
    include PgSearch::Model
    self.primary_key = 'id'

    has_one :moderation_status, foreign_key: :moderatable_id

    pg_search_scope :search_by_all,
      against: %i[content_title_multiloc content_body_multiloc],
      using: { tsearch: { prefix: true } }

    scope :with_moderation_status, (proc do |status|
      moderations = joins("LEFT JOIN moderation_moderation_statuses \
          ON moderation_moderation_statuses.moderatable_id = moderation_moderations.id AND \
             moderation_moderation_statuses.moderatable_type = moderation_moderations.moderatable_type")
      case status
      when 'read'
        moderations.where("moderation_moderation_statuses.status = 'read'")
      when 'unread'
        moderations.where("moderation_moderation_statuses.status = 'unread' or moderation_moderation_statuses.status is null")
      end
    end)

    # this isn't strictly necessary, but it will prevent
    # rails from calling save, which would fail anyway.
    def readonly?
      true
    end

    def source_record
      return unless %w[Idea Initiative Comment].include? moderatable_type

      moderatable_type.constantize.find(id)
    end

    def belongs_to(_preloaded = {})
      case moderatable_type
      when 'Idea'
        { project: { id: project_id, slug: project_slug, title_multiloc: project_title_multiloc } }
      when 'Initiative'
        {}
      when 'Comment'
        case post_type
        when 'Idea'
          { project: { id: project_id, slug: project_slug, title_multiloc: project_title_multiloc }, post_type.underscore.to_sym => { id: post_id, slug: post_slug, title_multiloc: post_title_multiloc } }
        when 'Initiative'
          { post_type.underscore.to_sym => { id: post_id, slug: post_slug, title_multiloc: post_title_multiloc } }
        end
      end
    end
  end
end

Moderation::Moderation.include(FlagInappropriateContent::Extensions::Moderation)
