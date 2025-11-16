import type { Api, ApiConfig, ApiParam } from '../types/project';

export function convertApiToConfig(api: Api): ApiConfig {
  // Convert parameters from Record<string, any> to Record<string, ApiParam>
  const parameters: Record<string, ApiParam> | undefined = api.parameters ? 
    Object.entries(api.parameters).reduce((acc, [key, value]) => {
      acc[key] = {
        name: key,
        value: String(value),
      };
      return acc;
    }, {} as Record<string, ApiParam>) : undefined;

  // Convert body from Record<string, any> to Record<string, ApiParam>
  const body: Record<string, ApiParam> | undefined = api.body ? 
    Object.entries(api.body).reduce((acc, [key, value]) => {
      acc[key] = {
        name: key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      };
      return acc;
    }, {} as Record<string, ApiParam>) : undefined;

  return {
    id: api.id,
    method: api.method,
    path: api.path,
    parameters,
    bodyA
  };
} 