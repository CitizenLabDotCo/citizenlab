class AdminPublicationsService
  def not_draft(scope)
    scope ||= AdminPublication.all

    scope.where.not(publication_status: :draft)
  end
end
