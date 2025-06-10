// src/services/firebaseHelpers.ts - פונקציות עזר לניקוי נתונים
export const cleanDataForFirestore = (data: any): any => {
  if (data === null || data === undefined) {
    return null;
  }

  if (Array.isArray(data)) {
    return data
      .filter(item => item !== null && item !== undefined)
      .map(item => cleanDataForFirestore(item));
  }

  if (typeof data === 'object' && data !== null) {
    const cleanedData: any = {};
    
    Object.keys(data).forEach(key => {
      const value = data[key];
      
      if (value !== undefined) {
        if (value === null) {
          cleanedData[key] = null;
        } else if (typeof value === 'string') {
          const trimmedValue = value.trim();
          if (trimmedValue !== '') {
            cleanedData[key] = trimmedValue;
          }
        } else if (Array.isArray(value)) {
          const cleanedArray = cleanDataForFirestore(value);
          if (cleanedArray.length > 0) {
            cleanedData[key] = cleanedArray;
          }
        } else if (typeof value === 'object') {
          const cleanedObject = cleanDataForFirestore(value);
          if (Object.keys(cleanedObject).length > 0) {
            cleanedData[key] = cleanedObject;
          }
        } else {
          cleanedData[key] = value;
        }
      }
    });
    
    return cleanedData;
  }

  return data;
};

export const validateTaskData = (taskData: any): string[] => {
  const errors: string[] = [];
  
  if (!taskData.title || typeof taskData.title !== 'string' || taskData.title.trim() === '') {
    errors.push('Task title is required');
  }
  
  if (taskData.priority && (taskData.priority < 1 || taskData.priority > 5)) {
    errors.push('Priority must be between 1 and 5');
  }
  
  if (taskData.dueDate) {
    const dueDate = new Date(taskData.dueDate);
    if (isNaN(dueDate.getTime())) {
      errors.push('Invalid due date');
    }
  }
  
  if (taskData.labels && !Array.isArray(taskData.labels)) {
    errors.push('Labels must be an array');
  }
  
  return errors;
};

export const validateProjectData = (projectData: any): string[] => {
  const errors: string[] = [];
  
  if (!projectData.name || typeof projectData.name !== 'string' || projectData.name.trim() === '') {
    errors.push('Project name is required');
  }
  
  if (projectData.color && typeof projectData.color !== 'string') {
    errors.push('Project color must be a string');
  }
  
  return errors;
};

export const validateLabelData = (labelData: any): string[] => {
  const errors: string[] = [];
  
  if (!labelData.name || typeof labelData.name !== 'string' || labelData.name.trim() === '') {
    errors.push('Label name is required');
  }
  
  if (labelData.color && typeof labelData.color !== 'string') {
    errors.push('Label color must be a string');
  }
  
  return errors;
};