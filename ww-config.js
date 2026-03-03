export default {
  editor: {
    label: { en: 'GDM Comms Log' },
    icon: 'pencil',
    customSettingsPropertiesOrder: [
      'viewMode',
      { label: 'Data', isCollapsible: true, properties: ['commsData', 'cmsItem', 'usersData', 'currentUserId'] },
      { label: 'Field mapping', isCollapsible: true, properties: ['idFormula', 'messageFormula', 'userIdFormula', 'cmsIdFormula', 'createdAtFormula'] },
      { label: 'Labels', isCollapsible: true, properties: ['articleTitleLabel', 'placeholderLabel', 'submitButtonText'] },
    ],
    customStylePropertiesOrder: [
      { label: 'Container', isCollapsible: true, properties: ['backgroundColor', 'borderRadius', 'maxHeight'] },
      { label: 'Messages', isCollapsible: true, properties: ['messageBackgroundColor', 'messageBorderColor', 'avatarBackgroundColor'] },
      { label: 'Input', isCollapsible: true, properties: ['inputBackgroundColor', 'inputBorderColor', 'accentColor'] },
      { label: 'Typography', isCollapsible: true, properties: ['fontFamily', 'fontSize', 'textColor'] },
    ],
  },
  triggerEvents: [
    {
      name: 'onAddComment',
      label: { en: 'On add comment' },
      event: { value: { message: null, cms_id: null, user_id: null } },
      default: true,
    },
    {
      name: 'onDeleteComment',
      label: { en: 'On delete comment (admin)' },
      event: { value: { id: null, message: null } },
    },
    {
      name: 'onCommentClick',
      label: { en: 'On comment click' },
      event: { value: { comment: null } },
    },
  ],
  properties: {
    viewMode: {
      label: { en: 'View mode' },
      type: 'TextSelect',
      section: 'settings',
      options: {
        options: [
          { value: 'admin', label: { en: 'Admin – Full control + delete' } },
          { value: 'client', label: { en: 'Client – Post & view only' } },
        ],
      },
      defaultValue: 'admin',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: { type: 'string', tooltip: '"admin" or "client"' },
      /* wwEditor:end */
    },
    commsData: {
      label: { en: 'Comments data' },
      type: 'ObjectList',
      section: 'settings',
      bindable: true,
      defaultValue: [],
      /* wwEditor:start */
      bindingValidation: { type: 'array', tooltip: 'List of comms_log rows (filtered by cms_id in Supabase/WeWeb)' },
      /* wwEditor:end */
    },
    cmsItem: {
      label: { en: 'CMS article' },
      type: 'Object',
      section: 'settings',
      bindable: true,
      defaultValue: null,
      /* wwEditor:start */
      bindingValidation: { type: 'object', tooltip: 'Current article this log belongs to (cms row)' },
      /* wwEditor:end */
    },
    usersData: {
      label: { en: 'Users data (optional)' },
      type: 'ObjectList',
      section: 'settings',
      bindable: true,
      defaultValue: [],
      /* wwEditor:start */
      bindingValidation: { type: 'array', tooltip: 'List of user_record rows for name lookup' },
      /* wwEditor:end */
    },
    currentUserId: {
      label: { en: 'Current user ID' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: '',
      /* wwEditor:start */
      bindingValidation: { type: 'string', tooltip: 'UUID of the logged-in user (for posting comments)' },
      /* wwEditor:end */
    },
    idFormula: {
      label: { en: 'ID field' },
      type: 'Formula',
      section: 'settings',
      options: (content) => ({
        template: Array.isArray(content.commsData) && content.commsData.length > 0 ? content.commsData[0] : null,
      }),
      defaultValue: { type: 'f', code: "context.mapping?.['id'] ?? context.id ?? ''" },
      hidden: (content, sidepanelContent, boundProps) => !boundProps?.commsData,
    },
    messageFormula: {
      label: { en: 'Message field' },
      type: 'Formula',
      section: 'settings',
      options: (content) => ({
        template: Array.isArray(content.commsData) && content.commsData.length > 0 ? content.commsData[0] : null,
      }),
      defaultValue: { type: 'f', code: "context.mapping?.['message'] ?? context.message ?? ''" },
      hidden: (content, sidepanelContent, boundProps) => !boundProps?.commsData,
    },
    userIdFormula: {
      label: { en: 'User ID field' },
      type: 'Formula',
      section: 'settings',
      options: (content) => ({
        template: Array.isArray(content.commsData) && content.commsData.length > 0 ? content.commsData[0] : null,
      }),
      defaultValue: { type: 'f', code: "context.mapping?.['user_id'] ?? context.user_id ?? ''" },
      hidden: (content, sidepanelContent, boundProps) => !boundProps?.commsData,
    },
    cmsIdFormula: {
      label: { en: 'CMS ID field' },
      type: 'Formula',
      section: 'settings',
      options: (content) => ({
        template: Array.isArray(content.commsData) && content.commsData.length > 0 ? content.commsData[0] : null,
      }),
      defaultValue: { type: 'f', code: "context.mapping?.['cms_id'] ?? context.cms_id ?? ''" },
      hidden: (content, sidepanelContent, boundProps) => !boundProps?.commsData,
    },
    createdAtFormula: {
      label: { en: 'Created at field' },
      type: 'Formula',
      section: 'settings',
      options: (content) => ({
        template: Array.isArray(content.commsData) && content.commsData.length > 0 ? content.commsData[0] : null,
      }),
      defaultValue: { type: 'f', code: "context.mapping?.['created_at'] ?? context.created_at ?? ''" },
      hidden: (content, sidepanelContent, boundProps) => !boundProps?.commsData,
    },
    articleTitleLabel: {
      label: { en: 'Header label' },
      type: 'Text',
      section: 'settings',
      multilang: true,
      defaultValue: 'Discussion',
      bindable: true,
    },
    placeholderLabel: {
      label: { en: 'Input placeholder' },
      type: 'Text',
      section: 'settings',
      multilang: true,
      defaultValue: 'Add a comment…',
      bindable: true,
    },
    submitButtonText: {
      label: { en: 'Post button text' },
      type: 'Text',
      section: 'settings',
      multilang: true,
      defaultValue: 'Post',
      bindable: true,
    },
    backgroundColor: {
      label: { en: 'Background' },
      type: 'Color',
      section: 'style',
      defaultValue: '#f8fafc',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: { cssSupports: 'color', type: 'string', tooltip: 'Container background' },
      /* wwEditor:end */
    },
    borderRadius: {
      label: { en: 'Border radius' },
      type: 'Length',
      section: 'style',
      options: { unitChoices: [{ value: 'px', label: 'px', min: 0, max: 24 }] },
      defaultValue: '14px',
      bindable: true,
    },
    maxHeight: {
      label: { en: 'Message list max height' },
      type: 'Length',
      section: 'style',
      options: { unitChoices: [{ value: 'px', label: 'px', min: 200, max: 800 }] },
      defaultValue: '420px',
      bindable: true,
    },
    messageBackgroundColor: {
      label: { en: 'Message bubble background' },
      type: 'Color',
      section: 'style',
      defaultValue: '#ffffff',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: { cssSupports: 'color', type: 'string', tooltip: 'Message bubble background' },
      /* wwEditor:end */
    },
    messageBorderColor: {
      label: { en: 'Message border' },
      type: 'Color',
      section: 'style',
      defaultValue: '#e2e8f0',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: { cssSupports: 'color', type: 'string', tooltip: 'Message border color' },
      /* wwEditor:end */
    },
    avatarBackgroundColor: {
      label: { en: 'Avatar background' },
      type: 'Color',
      section: 'style',
      defaultValue: '#0d9488',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: { cssSupports: 'color', type: 'string', tooltip: 'Avatar circle background' },
      /* wwEditor:end */
    },
    inputBackgroundColor: {
      label: { en: 'Input background' },
      type: 'Color',
      section: 'style',
      defaultValue: '#ffffff',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: { cssSupports: 'color', type: 'string', tooltip: 'Text input background' },
      /* wwEditor:end */
    },
    inputBorderColor: {
      label: { en: 'Input border' },
      type: 'Color',
      section: 'style',
      defaultValue: '#e2e8f0',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: { cssSupports: 'color', type: 'string', tooltip: 'Text input border' },
      /* wwEditor:end */
    },
    accentColor: {
      label: { en: 'Accent / button color' },
      type: 'Color',
      section: 'style',
      defaultValue: '#0d9488',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: { cssSupports: 'color', type: 'string', tooltip: 'Post button and link color' },
      /* wwEditor:end */
    },
    fontFamily: {
      label: { en: 'Font family' },
      type: 'FontFamily',
      section: 'style',
      defaultValue: 'DM Sans, system-ui, sans-serif',
      bindable: true,
    },
    fontSize: {
      label: { en: 'Font size' },
      type: 'Length',
      section: 'style',
      options: { unitChoices: [{ value: 'px', label: 'px', min: 12, max: 20 }] },
      defaultValue: '15px',
      bindable: true,
      responsive: true,
    },
    textColor: {
      label: { en: 'Text color' },
      type: 'Color',
      section: 'style',
      defaultValue: '#1e293b',
      bindable: true,
      /* wwEditor:start */
      bindingValidation: { cssSupports: 'color', type: 'string', tooltip: 'Main text color' },
      /* wwEditor:end */
    },
  },
};
