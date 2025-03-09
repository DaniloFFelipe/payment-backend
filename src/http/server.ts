import { errorHandler } from '@/http/errors'
import { env } from '@/lib/env'
import { fastifyCors } from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import fastify from 'fastify'
import {
  type ZodTypeProvider,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { routes } from './routes'

const app = fastify({
  logger: true,
}).withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.setErrorHandler(errorHandler)
app.register(fastifyCors, {
  origin: ['*', 'http://localhost:5174', 'http://localhost:5173'],
})

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Vid.io Api',
      description: 'Api Docs',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
})

app.register(fastifyJwt, {
  secret: env('AUTH_SECRET'),
})

app.register(routes, {
  prefix: '/api',
})

const bootstrap = async () => {
  const server = await app.listen({
    port: env('PORT'),
    host: '0.0.0.0',
  })

  console.log('Server running on ', server)
}

bootstrap()
