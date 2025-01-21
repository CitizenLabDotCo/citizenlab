# frozen_string_literal: true

class SideFxCustomFieldMatrixStatementService
  include SideFxHelper

  def after_create(statement, current_user)
    LogActivityJob.perform_later(statement, 'created', current_user, statement.created_at.to_i)
  end

  def after_update(statement, current_user)
    LogActivityJob.perform_later(statement, 'changed', current_user, statement.updated_at.to_i)
  end

  def after_destroy(frozen_statement, current_user)
    serialized_statement = clean_time_attributes(frozen_statement.attributes)
    LogActivityJob.perform_later(
      encode_frozen_resource(frozen_statement),
      'deleted',
      current_user,
      Time.now.to_i,
      payload: { custom_field_matrix_statement: serialized_statement }
    )
  end
end
