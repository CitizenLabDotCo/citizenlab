# frozen_string_literal: true

module IdeaCustomFields
  class UpdateAllService
    attr_reader :custom_form, :custom_fields_params, :current_user, :errors

    def initialize(custom_form, current_user, custom_fields:, fields_last_updated_at: nil, form_save_type: nil, form_opened_at: nil, params_size: nil)
      @custom_form = custom_form
      @current_user = current_user
      @custom_fields_from_params = custom_fields || []
      @fields_last_updated_at = fields_last_updated_at
      @form_save_type = form_save_type
      @form_opened_at = form_opened_at
      @params_size = params_size
      @errors = {}
      @page_count = 0
      @field_count = 0
    end

    def update_all
      validation_errors = validate
      return Result.failure(validation_errors) if validation_errors

      page_temp_ids_to_ids_mapping = {}
      option_temp_ids_to_ids_mapping = {}

      update_fields!(page_temp_ids_to_ids_mapping, option_temp_ids_to_ids_mapping)
      @custom_form.reload if @custom_form.persisted?
      update_logic!(page_temp_ids_to_ids_mapping, option_temp_ids_to_ids_mapping)
      update_form!

      Result.success(IdeaCustomFieldsService.new(@custom_form).all_fields)
    rescue UpdateAllFailedError => e
      Result.failure(e.errors)
    end

    private

    def validate
      validate_stale_form_data!
      fields = @custom_fields_from_params.map do |field|
        CustomField.new(
          field.slice(:code, :key, :input_type, :title_multiloc, :description_multiloc, :required, :enabled, :ordering)
        ).tap(&:readonly!)
      end
      CustomFieldsValidationService.new.validate(fields, @custom_form.participation_context.pmethod)
    end

    # To try and avoid forms being overwritten with stale data, we check if the form has been updated since the form editor last loaded it
    # But ONLY if the FE sends the fields_last_updated_at param
    def validate_stale_form_data!
      return unless @fields_last_updated_at.present? &&
                    @custom_form.persisted? &&
                    @custom_form.fields_last_updated_at.to_i > @fields_last_updated_at.to_datetime.to_i

      raise UpdateAllFailedError, { form: [{ error: 'stale_data' }] }
    end

    def update_fields!(page_temp_ids_to_ids_mapping, option_temp_ids_to_ids_mapping)
      idea_custom_fields_service = IdeaCustomFieldsService.new(@custom_form)
      fields = idea_custom_fields_service.all_fields
      fields_by_id = fields.index_by(&:id)
      given_fields = @custom_fields_from_params
      given_field_ids = given_fields.pluck(:id)

      ActiveRecord::Base.transaction do
        delete_fields = []
        delete_fields = fields.reject { |field| given_field_ids.include?(field.id) } if @custom_form.persisted?
        delete_fields.each { |field| delete_field!(field) }

        given_fields.each_with_index do |field_params, index|
          options_params = field_params.delete(:options)
          statements_params = field_params.delete(:matrix_statements)

          if field_params[:id] && fields_by_id.key?(field_params[:id])
            field = fields_by_id[field_params[:id]]
            next unless update_field!(field, field_params, index)
          else
            field = create_field!(field_params, page_temp_ids_to_ids_mapping, index)
            next unless field
          end

          if options_params
            option_mapping = update_options!(field, options_params, index)
            option_temp_ids_to_ids_mapping.merge!(option_mapping)
          end

          update_statements!(field, statements_params, index) if statements_params
          relate_map_config_to_field(field, field_params, index)
          field.move_to_bottom
          count_fields(field)
        end

        raise UpdateAllFailedError, @errors if @errors.present?
      end
    end

    def create_field!(field_params, page_temp_ids_to_ids_mapping, index)
      participation_method = @custom_form.participation_context.pmethod
      if field_params['code'].nil? && participation_method.allowed_extra_field_input_types.exclude?(field_params['input_type'])
        @errors[index.to_s] = { input_type: [{ error: 'inclusion', value: field_params['input_type'] }] }
        return false
      end

      create_params = field_params.except('temp_id').to_h
      if create_params.key?('code') && !create_params['code'].nil?
        default_field = participation_method.default_fields(@custom_form).find do |field|
          field.code == create_params['code']
        end
        create_params['key'] = default_field.key
      end

      field = CustomField.new(create_params.merge(resource: @custom_form))

      SideFxCustomFieldService.new.before_create(field, @current_user)
      if field.save
        page_temp_ids_to_ids_mapping[field_params[:temp_id]] = field.id if field_params[:temp_id]
        SideFxCustomFieldService.new.after_create(field, @current_user)
        field
      else
        @errors[index.to_s] = field.errors.details
        false
      end
    end

    def update_field!(field, field_params, index)
      idea_custom_field_service = IdeaCustomFieldsService.new(@custom_form)
      field_params = idea_custom_field_service.remove_ignored_update_params(field_params)

      field.assign_attributes(field_params)
      return true unless field.changed?

      if field.save
        SideFxCustomFieldService.new.after_update(field, @current_user)
        field
      else
        @errors[index.to_s] = field.errors.details
        false
      end
    end

    # Overridden in CustomMaps::Patches::IdeaCustomFields::UpdateAllService
    def relate_map_config_to_field(_field, _field_params, _index); end

    def delete_field!(field)
      SideFxCustomFieldService.new.before_destroy(field, @current_user)
      field.destroy!
      SideFxCustomFieldService.new.after_destroy(field, @current_user)
      field
    end

    def update_options!(field, options_params, field_index)
      {}.tap do |option_temp_ids_to_ids_mapping|
        options = field.options
        options_by_id = options.index_by(&:id)
        given_ids = options_params.pluck(:id)

        deleted_options = options.reject { |option| given_ids.include?(option.id) }
        deleted_options.each { |option| delete_option!(option) }

        options_params.each_with_index do |option_params, option_index|
          if option_params[:id] && options_by_id[option_params[:id]]
            option = options_by_id[option_params[:id]]
            next unless update_option!(option, option_params, field_index, option_index)
          else
            option = create_option!(option_params, field, option_temp_ids_to_ids_mapping, field_index, option_index)
            next unless option
          end
          update_option_image!(option, option_params[:image_id])
          option.move_to_bottom
        end
      end
    end

    def create_option!(option_params, field, option_temp_ids_to_ids_mapping, field_index, option_index)
      create_params = option_params.except('temp_id', 'image_id')
      option = CustomFieldOption.new(create_params.merge(custom_field: field))
      SideFxCustomFieldOptionService.new.before_create(option, @current_user)
      if option.save
        option_temp_ids_to_ids_mapping[option_params[:temp_id]] = option.id if option_params[:temp_id]
        SideFxCustomFieldOptionService.new.after_create(option, @current_user)
        option
      else
        add_options_errors(option.errors.details, field_index, option_index)
        false
      end
    end

    def update_option_image!(option, image_id)
      return unless image_id

      if image_id == ''
        option.image.destroy!
      else
        begin
          image = CustomFieldOptionImage.find(image_id)
          if image.custom_field_option.present? && image.custom_field_option != option
            image = image.dup
            image.save!
          end
          option.update!(image: image)
        rescue ActiveRecord::RecordNotFound
          # Catching this exception to stop the transaction failing if the image not found
        end
      end
    end

    def update_option!(option, option_params, field_index, option_index)
      update_params = option_params.except('image_id')
      option.assign_attributes(update_params)
      return true unless option.changed?

      SideFxCustomFieldOptionService.new.before_update(option, @current_user)
      if option.save
        SideFxCustomFieldOptionService.new.after_update(option, @current_user)
        option
      else
        add_options_errors(option.errors.details, field_index, option_index)
        false
      end
    end

    def delete_option!(option)
      CustomFields::Options::DestroyService.new.destroy!(option, @current_user)
    end

    def add_options_errors(options_errors, field_index, option_index)
      @errors[field_index.to_s] ||= {}
      @errors[field_index.to_s][:options] ||= {}
      @errors[field_index.to_s][:options][option_index.to_s] = options_errors
    end

    def update_statements!(field, statements_params, field_index)
      statements = field.matrix_statements
      statements_by_id = statements.index_by(&:id)
      given_ids = statements_params.pluck(:id)

      deleted_statements = statements.reject { |statement| given_ids.include?(statement.id) }
      deleted_statements.each { |statement| delete_statement!(statement) }

      statements_params.each_with_index do |statement_params, statement_index|
        if statement_params[:id] && statements_by_id[statement_params[:id]]
          statement = statements_by_id[statement_params[:id]]
          update_statement!(statement, statement_params, field_index, statement_index)
        else
          statement = create_statement!(statement_params, field, field_index, statement_index)
        end
        statement&.move_to_bottom
      end
    end

    def create_statement!(statement_params, field, field_index, statement_index)
      statement = CustomFieldMatrixStatement.new(statement_params.merge(custom_field: field))
      if statement.save
        SideFxCustomFieldMatrixStatementService.new.after_create(statement, @current_user)
      else
        add_statements_errors(statement.errors.details, field_index, statement_index)
      end
      statement
    end

    def update_statement!(statement, statement_params, field_index, statement_index)
      statement.assign_attributes(statement_params)
      return unless statement.changed?

      if statement.save
        SideFxCustomFieldMatrixStatementService.new.after_update(statement, @current_user)
      else
        add_statements_errors(statement.errors.details, field_index, statement_index)
      end
    end

    def delete_statement!(statement)
      statement.destroy!
      SideFxCustomFieldMatrixStatementService.new.after_destroy(statement, @current_user)
    end

    def add_statements_errors(statements_errors, field_index, statement_index)
      @errors[field_index.to_s] ||= {}
      @errors[field_index.to_s][:statements] ||= {}
      @errors[field_index.to_s][:statements][statement_index.to_s] = statements_errors
    end

    def update_logic!(page_temp_ids_to_ids_mapping, option_temp_ids_to_ids_mapping)
      fields = IdeaCustomFieldsService.new(@custom_form).all_fields
      form_logic = FormLogicService.new(fields)
      form_logic.replace_temp_ids!(page_temp_ids_to_ids_mapping, option_temp_ids_to_ids_mapping)

      return if form_logic.valid?

      logic_errors = {}
      fields.each_with_index do |field, index|
        logic_errors[index.to_s] = field.errors.details
      end
      raise UpdateAllFailedError, logic_errors
    end

    def update_form!
      return unless @custom_form.persisted?

      @custom_form.fields_updated!
      activity_payload = {
        save_type: @form_save_type,
        pages: @page_count,
        fields: @field_count,
        params_size: @params_size,
        form_opened_at: @form_opened_at&.to_datetime,
        form_updated_at: @custom_form.updated_at&.to_datetime
      }
      SideFxCustomFormService.new.after_update(@custom_form, @current_user, activity_payload)
    end

    def count_fields(field)
      case field.input_type
      when 'page'
        @page_count += 1
      else
        @field_count += 1
      end
    end

    # Result object for service responses
    class Result
      attr_reader :fields, :errors

      def initialize(success:, fields: nil, errors: nil)
        @success = success
        @fields = fields
        @errors = errors
      end

      def success?
        @success
      end

      def failure?
        !@success
      end

      def self.success(fields)
        new(success: true, fields: fields)
      end

      def self.failure(errors)
        new(success: false, errors: errors)
      end
    end

    class UpdateAllFailedError < RuntimeError
      attr_reader :errors

      def initialize(errors)
        super()
        @errors = errors
      end
    end
  end
end

IdeaCustomFields::UpdateAllService.prepend(CustomMaps::Patches::IdeaCustomFields::UpdateAllService)
