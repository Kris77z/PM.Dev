export interface PromptVariable {
  name: string
  type: 'text' | 'textarea' | 'select'
  label: string
  placeholder?: string
  required?: boolean
  options?: string[]
  defaultValue?: string
}

export interface PromptTemplate {
  id: string
  name: string
  description: string
  category: string
  prompt: string
  variables: PromptVariable[]
  tags: string[]
  isCustom?: boolean
  createdAt?: string
  updatedAt?: string
  emoji?: string
}

const CUSTOM_TEMPLATES_KEY = 'custom-prompt-templates'
let cachedPresetTemplates: PromptTemplate[] | null = null

function solidifyPromptTemplate(partial: Partial<PromptTemplate>, isCustomTemplate: boolean): PromptTemplate {
  const now = new Date().toISOString()
  const generatedId = isCustomTemplate 
    ? `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}` 
    : `preset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

  const defaults = {
    name: isCustomTemplate ? '未命名自定义模板' : '未命名预设',
    description: '',
    category: '其他',
    prompt: '',
    variables: [] as PromptVariable[],
    tags: [] as string[],
    createdAt: now,
    updatedAt: now,
    emoji: isCustomTemplate ? '✏️' : '✨',
  }

  const merged = {
    ...defaults,
    ...partial,
    id: partial.id || generatedId,
    isCustom: isCustomTemplate,
  }

  merged.variables = Array.isArray(merged.variables) ? merged.variables : []
  merged.tags = Array.isArray(merged.tags) ? merged.tags : []

  return merged as PromptTemplate
}

async function fetchPresetTemplates(filePath: string): Promise<PromptTemplate[]> {
  try {
    const response = await fetch(filePath)
    if (!response.ok) {
      console.error(`Failed to fetch preset templates from ${filePath}: ${response.statusText}`)
      return []
    }
    const data = await response.json() as Partial<PromptTemplate>[];
    if (!Array.isArray(data)) {
        console.error(`Data from ${filePath} is not an array.`);
        return [];
    }
    return data.map(t => solidifyPromptTemplate(t, false));
  } catch (error) {
    console.error(`Error fetching or parsing preset templates from ${filePath}:`, error);
    return [];
  }
}

export async function loadAllPresetTemplates(): Promise<PromptTemplate[]> {
  if (cachedPresetTemplates) {
    return cachedPresetTemplates;
  }

  const [pmTemplates] = await Promise.all([
    fetchPresetTemplates('/presets/pm-assistant-templates.json'),
    //fetchPresetTemplates('/presets/cherry-studio-templates.json')
  ]);
  cachedPresetTemplates = [...pmTemplates];
  return cachedPresetTemplates;
}

export const getCustomTemplates = (): PromptTemplate[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    if (!stored) return [];
    const parsedTemplates = JSON.parse(stored) as Partial<PromptTemplate>[];
    if (!Array.isArray(parsedTemplates)) return [];
    return parsedTemplates.map(t => solidifyPromptTemplate(t, true));
  } catch (error) {
    console.error('Failed to load custom templates:', error);
    return [];
  }
};

export const saveCustomTemplate = (templateData: Partial<PromptTemplate>) => {
  if (typeof window === 'undefined') return;
  try {
    const customTemplates = getCustomTemplates();
    const now = new Date().toISOString();
    const idToSave = templateData.id;
    const existingIndex = idToSave ? customTemplates.findIndex(t => t.id === idToSave) : -1;

    if (existingIndex !== -1 && idToSave) {
      const existingTemplate = customTemplates[existingIndex];
      const updatedTemplate = {
        ...existingTemplate,
        ...templateData,
        updatedAt: now,
        isCustom: true,
      };
      customTemplates[existingIndex] = solidifyPromptTemplate(updatedTemplate, true);
    } else {
      const newTemplateId = templateData.id && templateData.id.startsWith('custom-') 
        ? templateData.id 
        : `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newTemplate = solidifyPromptTemplate({
        ...templateData,
        id: newTemplateId,
        createdAt: templateData.createdAt || now,
        updatedAt: now,
      }, true);
      customTemplates.push(newTemplate);
    }
    
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(customTemplates));
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.error('Failed to save custom template:', error);
  }
};

export const deleteCustomTemplate = (templateId: string) => {
  if (typeof window === 'undefined') return;
  try {
    const customTemplates = getCustomTemplates();
    const filtered = customTemplates.filter(t => t.id !== templateId);
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.error('Failed to delete custom template:', error);
  }
};

export async function getAllTemplates(): Promise<PromptTemplate[]> {
  const presets = await loadAllPresetTemplates();
  const customs = getCustomTemplates();
  return [...presets, ...customs];
}

export const getCategoriesFromTemplates = (templates: PromptTemplate[]): string[] => {
  if (!Array.isArray(templates)) return [];
  const categories = new Set(templates.map(template => template.category).filter(Boolean));
  return Array.from(categories).sort();
};

export const searchTemplatesInList = (query: string, category: string | undefined, templates: PromptTemplate[]): PromptTemplate[] => {
  if (!Array.isArray(templates)) return [];
  let filteredTemplates = templates;

  if (category && category.toLowerCase() !== 'all') {
    filteredTemplates = filteredTemplates.filter(template => template.category === category);
  }

  if (query.trim()) {
    const lowerQuery = query.toLowerCase();
    filteredTemplates = filteredTemplates.filter(template =>
      (template.name && template.name.toLowerCase().includes(lowerQuery)) ||
      (template.description && template.description.toLowerCase().includes(lowerQuery)) ||
      (template.tags && template.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    );
  }
  return filteredTemplates;
};

// Ensure no old template constants (TRANSLATION_TEMPLATES, ALL_TEMPLATES, etc.) remain.
// All preset templates are now loaded from JSON files.

 