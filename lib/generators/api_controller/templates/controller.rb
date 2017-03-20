<% module_namespacing do -%>
class Api::V1::<%= controller_class_name %>Controller < ApplicationController
  # list
  def index
    send_success(find_all)
  end

  # get
  def show
    send_success(find)
  rescue ActiveRecord::RecordNotFound
    send_not_found
  end

  # insert
  def create
    <%= singular_table_name %> = <%= orm_class.build(class_name, "#{singular_table_name}_params") %>
    <%= singular_table_name %>.save!
    send_success(<%= singular_table_name %>, 201)
  rescue ActiveRecord::RecordInvalid
    send_error(<%= singular_table_name %>.errors)
  rescue ActiveRecord::RecordNotFound => e
    send_error(e.message)
  end

  # patch
  def update
    <%= singular_table_name %> = find
    <%= singular_table_name %>.update!(<%= singular_table_name %>_params)
    send_success(<%= singular_table_name %>)
  rescue ActiveRecord::RecordNotFound
    send_not_found
  rescue ActiveRecord::RecordInvalid
    send_error(<%= singular_table_name %>.errors)
  end

  # delete
  def destroy
    <%= singular_table_name %> = find
    <%= singular_table_name %>.destroy
    send_no_content
  rescue ActiveRecord::RecordNotFound
    send_not_found
  end

  private
  def <%= "#{singular_table_name}_params" %>
    params.require(:<%= singular_table_name %>).permit(
      <%= (class_name.constantize.column_names - ['id', 'created_at', 'updated_at']).map { |name| ":#{name}" }.join(",\n\t\t\t") %>)
  end

  def find_all
    <%= orm_class.all(class_name) %>
  end

  def find
    <%= orm_class.find(class_name, "params[:id]") %>
  end
end
<% end -%>
