module Moderation
  class Moderation < ActiveRecord::Base
    include PgSearch::Model
    self.primary_key = 'id'

    has_one :moderation_status, foreign_key: :moderatable_id, foreign_type: :moderatable_type, as: :moderatable

    pg_search_scope :search_by_all, 
        :against => [:content_title_multiloc, :content_body_multiloc],
        :using => { :tsearch => {:prefix => true} }

    scope :with_moderation_status, (Proc.new do |status|
      moderations = joins("LEFT JOIN moderation_moderation_statuses \
          ON moderation_moderation_statuses.moderatable_id = moderation_moderations.id AND \
             moderation_moderation_statuses.moderatable_type = moderation_moderations.moderatable_type"
        )
      case status
      when 'read'
        moderations.where(moderation_moderation_statuses: {status: 'read'})
      when 'unread'
        moderations.where(moderation_moderation_statuses: {status: ['unread', nil]})
      end
    end)


    # this isn't strictly necessary, but it will prevent
    # rails from calling save, which would fail anyway.
    def readonly?
      true
    end

    def source_record
      if %w(Idea Initiative Comment).include? moderatable_type
        moderatable_type.constantize.find(id)
      end
    end

    def belongs_to preloaded={}
      case moderatable_type
      when 'Idea'
        {project: {id: project_id, slug: project_slug, title_multiloc: project_title_multiloc}}
      when 'Initiative'
        {}
      when 'Comment'
        case post_type
        when 'Idea'
          {project: {id: project_id, slug: project_slug, title_multiloc: project_title_multiloc}, post_type.underscore.to_sym => {id: post_id, slug: post_slug, title_multiloc: post_title_multiloc}}
        when 'Initiative'
          {post_type.underscore.to_sym => {id: post_id, slug: post_slug, title_multiloc: post_title_multiloc}}
        end
      end
    end
    
  end
end

Moderation::Moderation.include_if_ee 'FlagInappropriateContent::Extensions::Moderation'