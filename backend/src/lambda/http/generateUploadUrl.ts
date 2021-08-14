import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { getTodoById, getUploadUrl } from '../../businessLogic/todos'


// import { createAttachmentPresignedUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils'

const logger = createLogger('todo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)

    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    if(!todoId){
      logger.error(`todo id ${todoId} is missing`)
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'todoId is required'
        }) 
      }
    }

    const item = await getTodoById(todoId, userId)
    if (item.Count == 0){
      logger.error(`todo id ${todoId} is not found`)
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'todo is not found'
        }) 
      }
    }

    if (item.Items[0].userId !== userId) {
      logger.error(`the user ${userId} is requesting todo put url and this this todo ${todoId} is owned by another user`)
      return {
        statusCode: 401,
        body: 'todo belong to another user'
      }
    }

    const url = await getUploadUrl(todoId);


    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl: url
      })
    }
  }
)

handler
  .use(
    cors({
      credentials: true
    })
  )
