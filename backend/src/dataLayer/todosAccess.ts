import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';


const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
  
const logger = createLogger('dataLayer:todosAccess')

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly createdAtIndex = process.env.CREATED_AT_INDEX 
        ){
    }

    async getTodoById(todoId: string, userId: string): Promise<AWS.DynamoDB.QueryOutput>{
        
        logger.info(`Getting todo item by id ${todoId} for user ${userId}`)

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
        
        logger.info(`Deleted todo ${todoId} for user ${userId}`)
    }

    async updateTodo(todoId: string, userId: string, updatedTodo: TodoUpdate){
         
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
              todoId,
              userId
            },
            UpdateExpression: 'set #name = :name, #dueDate = :dueDate, #done = :done',
            ExpressionAttributeNames: {
              '#name': 'name',
              '#dueDate': 'dueDate',
              '#done': 'done'
            },
            ExpressionAttributeValues: {
                ':name': updatedTodo.name,
                ':dueDate': updatedTodo.dueDate,
                ':done': updatedTodo.done
            }
        }).promise()
        
        logger.info(`Updated todo ${todoId} for user ${userId}`) 
    }

}