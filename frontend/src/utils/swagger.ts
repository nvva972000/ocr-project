export interface SwaggerSchema {
  definitions?: Record<string, any>;
  components?: {
    schemas?: Record<string, any>;
  };
}

export interface SwaggerParameter {
  name: string;
  in: 'query' | 'path' | 'body' | 'header';
  value: any;
  required?: boolean;
  description?: string;
}

export interface SwaggerResponse {
  parameters: SwaggerParameter[];
  body: any | null;
  responseSchema?: {
    schema: any;
    description?: string;
    statusCode: string;
  };
  fullUrl?: string;
}

function resolveRef(ref: string, schema: SwaggerSchema): any {
  // Remove the #/ prefix
  const path = ref.replace('#/', '').split('/');
  
  // Navigate through the schema
  let current: any = schema;
  for (const segment of path) {
    if (!current[segment]) {
      throw new Error(`Could not resolve reference: ${ref}`);
    }
    current = current[segment];
  }
  
  return current;
}

function generateSampleValue(property: any, schema: SwaggerSchema): any {
  if (property.$ref) {
    const resolvedSchema = resolveRef(property.$ref, schema);
    return generateSampleFromSchema(resolvedSchema, schema);
  }

  switch (property.type) {
    case 'string':
      return property.example || 'string';
    case 'integer':
    case 'number':
      return property.example || 0;
    case 'boolean':
      return property.example || false;
    case 'array':
      if (property.items) {
        return [generateSampleValue(property.items, schema)];
      }
      return [];
    case 'object':
      if (property.properties) {
        return generateSampleFromSchema(property, schema);
      }
      return {};
    default:
      return null;
  }
}

function generateSampleFromSchema(schema: any, rootSchema: SwaggerSchema): any {
  if (!schema.properties) {
    return {};
  }

  const result: Record<string, any> = {};

  for (const [key, property] of Object.entries<any>(schema.properties)) {
    result[key] = generateSampleValue(property, rootSchema);
  }

  return result;
}

function generateParameterValue(parameter: any, schema: SwaggerSchema): any {
  if (parameter.schema) {
    if (parameter.schema.$ref) {
      const resolvedSchema = resolveRef(parameter.schema.$ref, schema);
      return generateSampleFromSchema(resolvedSchema, schema);
    }
    return generateSampleValue(parameter.schema, schema);
  }

  return generateSampleValue(parameter, schema);
}

export async function generateRequestBody(path: string, method: string, swaggerUrl: string): Promise<SwaggerResponse> {
  try {
    // Fetch and parse swagger document
    const response = await fetch(swaggerUrl);
    const swaggerDoc: any = await response.json();

    // Get the operation object
    const pathObj = swaggerDoc.paths[path];
    if (!pathObj) {
      throw new Error(`Path ${path} not found in swagger doc`);
    }

    const operation = pathObj[method.toLowerCase()];
    if (!operation) {
      throw new Error(`Method ${method} not found for path ${path}`);
    }

    // Build full URL from swagger host and path
    let fullUrl = '';
    if (swaggerDoc.host) {
      const scheme = swaggerDoc.schemes?.[0] || 'https';
      const basePath = swaggerDoc.basePath || '';
      
      // Remove duplicate slashes and ensure proper path joining
      const cleanPath = (p: string) => p.replace(/^\/+|\/+$/g, '');
      const parts = [
        scheme + '://' + swaggerDoc.host,
        cleanPath(basePath),
        cleanPath(path)
      ].filter(Boolean); // Remove empty strings
      
      fullUrl = parts.join('/');
    }

    // Get all parameters
    const parameters: SwaggerParameter[] = [];
    
    // Add path parameters from path template
    const pathParams = path.match(/{([^}]+)}/g) || [];
    pathParams.forEach(param => {
      const paramName = param.slice(1, -1);
      const paramDef = operation.parameters?.find((p: any) => p.name === paramName && p.in === 'path');
      if (paramDef) {
        parameters.push({
          name: paramName,
          in: 'path',
          value: generateParameterValue(paramDef, swaggerDoc),
          required: true,
          description: paramDef.description
        });
      }
    });

    // Add other parameters from operation
    if (operation.parameters) {
      operation.parameters.forEach((param: any) => {
        if (param.in !== 'body' && !parameters.some(p => p.name === param.name)) {
          parameters.push({
            name: param.name,
            in: param.in,
            value: generateParameterValue(param, swaggerDoc),
            required: param.required,
            description: param.description
          });
        }
      });
    }

    // Get request body
    let body = null;

    // For OpenAPI 3.0
    if (operation.requestBody?.content?.['application/json']?.schema) {
      const schema = operation.requestBody.content['application/json'].schema;
      if (schema.$ref) {
        const resolvedSchema = resolveRef(schema.$ref, swaggerDoc);
        body = generateSampleFromSchema(resolvedSchema, swaggerDoc);
      } else {
        body = generateSampleFromSchema(schema, swaggerDoc);
      }
    }
    // For Swagger 2.0
    else {
      const bodyParam = operation.parameters?.find((p: any) => p.in === 'body');
      if (bodyParam?.schema) {
        if (bodyParam.schema.$ref) {
          const resolvedSchema = resolveRef(bodyParam.schema.$ref, swaggerDoc);
          body = generateSampleFromSchema(resolvedSchema, swaggerDoc);
        } else {
          body = generateSampleFromSchema(bodyParam.schema, swaggerDoc);
        }
      }
    }

    // Get response schema
    let responseSchema: SwaggerResponse['responseSchema'] = undefined;
    
    // For OpenAPI 3.0 and Swagger 2.0
    if (operation.responses) {
      // First try to get 200 or 201 response
      const successStatusCodes = ['200', '201'];
      for (const statusCode of successStatusCodes) {
        const response = operation.responses[statusCode];
        if (response) {
          let schema;
          // OpenAPI 3.0
          if (response.content?.['application/json']?.schema) {
            schema = response.content['application/json'].schema;
          }
          // Swagger 2.0
          else if (response.schema) {
            schema = response.schema;
          }

          if (schema) {
            let resolvedSchema;
            if (schema.$ref) {
              resolvedSchema = resolveRef(schema.$ref, swaggerDoc);
            } else {
              resolvedSchema = schema;
            }

            responseSchema = {
              schema: generateSampleFromSchema(resolvedSchema, swaggerDoc),
              description: response.description,
              statusCode
            };
            break;
          }
        }
      }
    }

    return {
      parameters,
      body,
      responseSchema,
      fullUrl
    };
  } catch (error) {
    console.error('Error generating request body:', error);
    return {
      parameters: [],
      body: null,
      responseSchema: undefined,
      fullUrl: undefined
    };
  }
} 