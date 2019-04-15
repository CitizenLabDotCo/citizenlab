class ErrorsService

  def remove errors, attribute, message=:invalid, options={}
    # After https://stackoverflow.com/a/7315296/3585671
    keep = errors.details.to_h
    errors.clear
    keep[attribute].delete({error: message, **options})
    keep.each do |attribute, suberrors|
      suberrors.each do |suberror|
        message = suberror.delete :error
        errors.add attribute, message, suberror
      end
    end
    errors
  end
end