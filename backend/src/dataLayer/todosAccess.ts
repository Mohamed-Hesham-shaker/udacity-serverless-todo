import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
// import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
// import { TodoUpdate } from '../models/TodoUpdate';


const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})
  
// const logger = createLogger(' ')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION, 
        private readonly createdAtIndex = process.env.CREATED_AT_INDEX
        ){
    }

    async getTodoById(todoId: string, userId: string): Promise<AWS.DynamoDB.QueryOutput>{
        
        return await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.createdAtIndex,
            KeyConditionExpression: 'todoId = :todoId and userId = :userId',
            ExpressionAttributeValues:{
                ':todoId': todoId,
                ":userId": userId
            }
        }).promise()   
    }

    async getUploadUrl(todoId: string): Promise<string>{
        
        return await s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: todoId,
            Expires: this.urlExpiration
          }) as string ;
    }

    async createTodo(todoItem: TodoItem): Promise<TodoItem>{
        
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem
        }).promise()

        return todoItem
    }

    async getTodosForUser(userId: string): Promise<TodoItem[]> {
       
       const result = await this.docClient.query({
          TableName: this.todosTable,
          IndexName: this.createdAtIndex,
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues:{
              ":userId": userId
          }
        }).promise() 
        
        return result.Items as TodoItem[]
    }

    async deleteTodo(todoId: string, userId: string) {
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
              todoId,
              userId
            }
        }).promise() 
    }

}