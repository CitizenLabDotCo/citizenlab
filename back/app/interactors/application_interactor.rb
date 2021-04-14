class ApplicationInteractor
  include Interactor

  delegate :fail!, to: :context
end
