import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    const userId = getUserId(event)

    if (!todoId) {
      // logger.error(`todo id ${todoId} is missing`)
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'todoId is required'
        }) 
      }
    }

    await updateTodo(todoId, userId, updatedTodo)

    return {
      statusCode: 200,
      body: JSON.stringify({})
    }
  }
)

handler
  .use(
    cors({
      credentials: true
    })
  )
