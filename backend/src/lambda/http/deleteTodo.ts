import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'

const logger =  createLogger('lambda:deleteTodo');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)

    logger.info(`user id ${userId} makes a request to delete todo with id ${todoId}`)

    if (!todoId) {
      
      logger.error(`todo id ${todoId} is missing`)
      
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'todoId is required'
        }) 
      }
    }


    await deleteTodo(todoId, userId)

    logger.info(`Delete todo item ${todoId}`)

    return {
      statusCode: 200,
      body: JSON.stringify({})
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
