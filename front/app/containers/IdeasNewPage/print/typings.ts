export interface Element {
  type: 'Control';
  scope: string;
  label: string;
  options: {
    description: string;
    input_type: 'select' | 'multiselect' | 'text' | 'multiline_text';
    isAdminField: boolean;
    hasRule: boolean;
    enumNames?: string[];
    transform?: 'trim_on_blur';
    textarea?: boolean;
  };
}
