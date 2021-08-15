import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

const logger =  createLogger('lambda:createTodo');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)

    const userId = getUserId(event)

    logger.info(`user id ${userId} makes a request to create todo`)

    const item = await createTodo(newTodo, userId)

    logger.info(`Creating todo item ${item} for ${userId}`)
    
    return {
      statusCode: 201,
      body: JSON.stringify({
        item
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
