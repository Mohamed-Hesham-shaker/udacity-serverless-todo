import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

const logger =  createLogger('todo');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    // TODO: Implement creating a new TODO item
    const userId = getUserId(event)

    logger.info(`user id ${userId} makes a request to create todo`)

    const todoItem = await createTodo(newTodo, userId)
    return {
      statusCode: 201,
      body: JSON.stringify({
        todoItem
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
