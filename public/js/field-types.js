// Field Types Registry
// This file manages the behavior, rendering, and properties of all Steedos field types.

const FieldTypes = {
    // Base configuration for common properties
    base: {
        properties: [
            { name: 'name_key', label: 'Field Name (API)', type: 'text', required: true },
            { name: 'label', label: 'Label', type: 'text', required: true },
            { name: 'type', label: 'Type', type: 'select', options: 'getFieldTypeOptions' }, // Function reference
            { name: 'defaultValue', label: 'Default Value', type: 'text' },
            { name: 'required', label: 'Required', type: 'boolean' },
            { name: 'readonly', label: 'Read Only', type: 'boolean' },
            { name: 'hidden', label: 'Hidden', type: 'boolean' },
            { name: 'is_wide', label: 'Wide Display', type: 'boolean' },
            { name: 'searchable', label: 'Searchable', type: 'boolean' },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'inlineHelpText', label: 'Help Text', type: 'textarea' }
        ],
        renderReadOnly: (field) => `<div class="w-full rounded-lg border border-gray-200/50 bg-gray-100/50 px-3 h-10 flex items-center text-gray-400 text-sm whitespace-nowrap overflow-hidden text-ellipsis">${field.label || 'Field'}</div>`,
        renderInput: (field) => `<div class="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 h-10 flex items-center text-gray-400 text-sm"></div>`
    },

    // --- Text & Input ---
    text: {
        icon: 'text',
        label: 'Text',
        renderInput: () => `<div class="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 h-10 flex items-center transition-colors group-hover:bg-white group-hover:border-blue-200/50 group-hover:shadow-sm"></div>`
    },
    textarea: {
        icon: 'file-text-line',
        label: 'Long Text',
        isWide: true,
        renderInput: () => `<div class="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 h-24 transition-colors group-hover:bg-white group-hover:border-blue-200/50 group-hover:shadow-sm"></div>`,
        properties: [
            { name: 'rows', label: 'Rows', type: 'number', defaultValue: 3 }
        ]
    },
    html: {
        icon: 'article-line',
        label: 'Rich Text',
        isWide: true,
        renderInput: () => `<div class="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 h-24 flex items-center justify-center text-gray-400 border-dashed transition-colors group-hover:bg-white group-hover:border-blue-200/50 group-hover:shadow-sm"><span class="text-xs">Rich Text Editor</span></div>`
    },
    markdown: {
        icon: 'markdown-line',
        label: 'Markdown',
        isWide: true,
        renderInput: () => `<div class="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 h-24 flex items-center justify-center text-gray-400 border-dashed transition-colors group-hover:bg-white group-hover:border-blue-200/50 group-hover:shadow-sm"><span class="text-xs">Markdown Editor</span></div>`
    },
    code: {
        icon: 'code-line',
        label: 'Code',
        isWide: true,
        renderInput: () => `<div class="w-full rounded-lg border border-gray-200 bg-black/90 px-3 h-24 flex items-center justify-center text-gray-400 font-mono text-xs">Code Editor</div>`
    },
    email: {
        icon: 'mail-line',
        label: 'Email',
        renderInput: () => `<div class="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 h-10 flex items-center gap-2 transition-colors group-hover:bg-white group-hover:border-blue-200/50 group-hover:shadow-sm"><i class="ri-mail-line text-gray-300"></i></div>`
    },
    url: {
        icon: 'link',
        label: 'URL',
        renderInput: () => `<div class="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 h-10 flex items-center text-blue-500 underline decoration-blue-300 decoration-1 underline-offset-2 text-sm transition-colors group-hover:bg-white group-hover:border-blue-200/50 group-hover:shadow-sm">http://...</div>`
    },

    // --- Numbers & Currency ---
    number: {
        icon: 'hashtag',
        label: 'Number',
        renderInput: () => `<div class="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 h-10 flex items-center justify-end transition-colors group-hover:bg-white group-hover:border-blue-200/50 group-hover:shadow-sm"><span class="text-gray-300">0</span></div>`,
        properties: [
             { name: 'scale', label: 'Decimal Places', type: 'number', defaultValue: 0 },
             { name: 'precision', label: 'Precision', type: 'number', defaultValue: 18 }
        ]
    },
    currency: {
        icon: 'money-dollar-circle-line',
        label: 'Currency',
        renderInput: () => `<div class="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 h-10 flex items-center transition-colors group-hover:bg-white group-hover:border-blue-200/50 group-hover:shadow-sm"><span class="text-gray-400 mr-1">$</span></div>`,
         properties: [
             { name: 'scale', label: 'Decimal Places', type: 'number', defaultValue: 2 },
             { name: 'precision', label: 'Precision', type: 'number', defaultValue: 18 }
        ]
    },
    percent: {
        icon: 'percent-line',
        label: 'Percent',
        renderInput: () => `<div class="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 h-10 flex items-center justify-between transition-colors group-hover:bg-white group-hover:border-blue-200/50 group-hover:shadow-sm"><span></span><span class="text-gray-400">%</span></div>`,
         properties: [
             { name: 'scale', label: 'Decimal Places', type: 'number', defaultValue: 2 },
             { name: 'precision', label: 'Precision', type: 'number', defaultValue: 18 }
        ]
    },

    // --- Date & Time ---
    date: {
        icon: 'calendar-line',
        label: 'Date',
        renderInput: () => `<div class="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 h-10 flex items-center justify-between transition-colors group-hover:bg-white group-hover:border-blue-200/50 group-hover:shadow-sm"><span class="text-sm text-gray-400">YYYY-MM-DD</span><i class="ri-calendar-line text-gray-400 text-sm"></i></div>`
    },
    datetime: {
        icon: 'calendar-check-line',
        label: 'Date/Time',
        renderInput: () => `<div class="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 h-10 flex items-center justify-between transition-colors group-hover:bg-white group-hover:border-blue-200/50 group-hover:shadow-sm"><span class="text-sm text-gray-400">YYYY-MM-DD HH:mm</span><i class="ri-calendar-check-line text-gray-400 text-sm"></i></div>`
    },
    time: {
        icon: 'time-line',
        label: 'Time',
        renderInput: () => `<div class="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 h-10 flex items-center justify-between transition-colors group-hover:bg-white group-hover:border-blue-200/50 group-hover:shadow-sm"><span class="text-sm text-gray-400">HH:mm</span><i class="ri-time-line text-gray-400 text-sm"></i></div>`
    },

    // --- Logic & Choice ---
    boolean: {
        icon: 'checkbox-line',
        label: 'Checkbox',
        renderInput: () => `<div class="flex items-center gap-2 h-10"><div class="w-5 h-5 border border-gray-300 rounded bg-white shadow-sm flex items-center justify-center text-blue-500"></div><span class="text-sm text-gray-600">Checkbox Label</span></div>`
    },
    select: {
        icon: 'list-check',
        label: 'Select',
        renderInput: () => `<div class="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 h-10 flex items-center justify-between transition-colors group-hover:bg-white group-hover:border-blue-200/50 group-hover:shadow-sm"><span class="text-sm text-gray-400">Select...</span><i class="ri-expand-up-down-line text-gray-400 text-sm"></i></div>`,
        properties: [
            { name: 'options', label: 'Options (YAML or JSON)', type: 'textarea', rows: 6 },
            { name: 'multiple', label: 'Allow Multiple', type: 'boolean' }
        ]
    },

    // --- Relationships ---
    lookup: {
        icon: 'search-line',
        label: 'Lookup',
        renderInput: (field) => `<div class="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 h-10 flex items-center justify-between transition-colors group-hover:bg-white group-hover:border-blue-200/50 group-hover:shadow-sm"><span class="text-sm text-gray-400 flex items-center gap-1"><i class="ri-search-line text-xs text-blue-500"></i> Search ${field.reference_to || 'records'}...</span></div>`,
        properties: [
            { name: 'reference_to', label: 'Reference Object', type: 'text', required: true }
        ]
    },
    master_detail: {
        icon: 'links-line',
        label: 'Master-Detail',
        renderInput: (field) => `<div class="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 h-10 flex items-center justify-between transition-colors group-hover:bg-white group-hover:border-blue-200/50 group-hover:shadow-sm"><span class="text-sm text-gray-400 flex items-center gap-1"><i class="ri-links-line text-xs text-blue-500"></i> ${field.reference_to || 'Parent Record'}</span></div>`,
        properties: [
            { name: 'reference_to', label: 'Reference Object', type: 'text', required: true },
             { name: 'write_requires_master_read', label: 'Requires Read Access', type: 'boolean' }
        ]
    },

    // --- Advanced ---
    formula: {
        icon: 'functions',
        label: 'Formula',
        renderInput: () => `<div class="w-full rounded-lg border border-gray-200/50 bg-gray-100/50 px-3 h-10 flex items-center gap-2 text-gray-400 text-sm"><i class="ri-functions text-xs"></i> Formula Result</div>`,
        properties: [
            { name: 'formula', label: 'Formula Expression', type: 'textarea', required: true },
            { name: 'data_type', label: 'Return Type', type: 'select', options: [
                {label:'Text', value:'text'}, {label:'Number', value:'number'}, {label:'Checkbox', value:'boolean'}, {label:'Date', value:'date'}
            ]}
        ]
    },
    summary: {
        icon: 'calculator-line',
        label: 'Roll-Up Summary',
        renderInput: () => `<div class="w-full rounded-lg border border-gray-200/50 bg-gray-100/50 px-3 h-10 flex items-center gap-2 text-gray-400 text-sm"><i class="ri-calculator-line text-xs"></i> Roll-Up Summary</div>`,
        properties: [
             { name: 'summary_object', label: 'Summarized Object', type: 'text' }
        ]
    },
    autonumber: {
        icon: 'list-ordered',
        label: 'Auto Number',
        renderInput: () => `<div class="w-full rounded-lg border border-gray-200/50 bg-gray-100/50 px-3 h-10 flex items-center gap-2 text-gray-400 text-sm"><i class="ri-list-ordered text-xs"></i> {0000}</div>`,
         properties: [
            { name: 'defaultValue', label: 'Display Format', type: 'text', defaultValue: '{0000}' }
        ]
    },
    section: {
        icon: 'layout-row-line',
        label: 'Section',
        isWide: true,
        renderInput: () => '', // Sections have special rendering logic in the main loop currently
        properties: [
             { name: 'label', label: 'Section Label', type: 'text' }
        ]
    }
};


// Public API to get definition
function getFieldType(type) {
    return FieldTypes[type] || FieldTypes.text; // Default to text
}

// Helpers for options
function getFieldTypeOptions() {
    // Generate valid options for the 'type' select box
    return Object.keys(FieldTypes).filter(k => k !== 'base').map(k => ({
        label: FieldTypes[k].label,
        value: k
    }));
}
