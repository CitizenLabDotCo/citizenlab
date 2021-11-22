class AdminPublicationsService
 def for_homepage scope
  scope ||= AdminPublication.all

  scope.where.not(publication_status: :draft).includes(:parent)
 end
end
