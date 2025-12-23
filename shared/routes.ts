import { z } from 'zod';
import { insertOptionSchema, insertHistorySchema, options, history } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  options: {
    list: {
      method: 'GET' as const,
      path: '/api/options',
      responses: {
        200: z.array(z.custom<typeof options.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/options/:id',
      responses: {
        200: z.custom<typeof options.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/options',
      input: insertOptionSchema,
      responses: {
        201: z.custom<typeof options.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/options/:id',
      input: insertOptionSchema.partial(),
      responses: {
        200: z.custom<typeof options.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/options/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    lockIn: {
      method: 'POST' as const,
      path: '/api/options/:id/lock',
      responses: {
        200: z.custom<typeof options.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  history: {
    list: {
      method: 'GET' as const,
      path: '/api/history',
      responses: {
        200: z.array(z.custom<typeof history.$inferSelect>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
