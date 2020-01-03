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

  def belongs_to
    obj = source_record
    case moderatable_type
    when 'Idea'
      {project: obj.project}
    when 'Initiative'
      {project: obj.project}
    when 'Comment'
      {project: obj.project, moderatable_type.underscore.to_sym => obj}
    end.map do |key, object|
      [key, {id: object.id, slug: object.slug, title_multiloc: object.title_multiloc}]
    end.to_h
  end
end