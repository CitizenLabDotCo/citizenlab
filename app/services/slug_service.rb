class SlugService

  def generate_slug record, title
    slug = title.parameterize
    indexedSlug = nil
    i=0
    while record.class.find_by(slug: indexedSlug || slug)
      i +=1
      indexedSlug = [slug, '-', i].join
    end
    indexedSlug || slug
  end

  def regex
    /\A[A-Za-z0-9_]+(?:-[A-Za-z0-9_]+)*\z/
  end

end