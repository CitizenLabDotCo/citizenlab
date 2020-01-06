class Moderation < ActiveRecord::Base
  self.primary_key = 'id'

  has_one :moderation_status, -> (m) { where(moderatable_type: m.moderatable_type) }, foreign_key: :moderatable_id

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