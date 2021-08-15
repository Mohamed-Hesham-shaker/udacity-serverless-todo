import { TodosAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
// import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
// import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'

const logger = createLogger('auth')

// TODO: Implement businessLogic
const todoAccess = new TodosAccess()
const bucketName = process.env.ATTACHMENT_S3_BUCKET

export async function getTodoById(todoId: string, userId: string) : Promise<any>{
    return await todoAccess.getTodoById(todoId, userId)
}  

export async function getUploadUrl(todoId: string): Promise<string> {
    return await todoAccess.getUploadUrl(todoId)
} 

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    userId: string
): Promise<TodoItem>{

    const todoId = uuid.v4()
    logger.info(`Generating uuid value ${todoId}`)

    return await todoAccess.createTodo({
        todoId,
        userId,
        ...createTodoRequest,
        createdAt: new Date().toISOString(),
        done: false,
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`
    })
}

export async function getTodosForUser(userId: string) : Promise<TodoItem[]>{
    return await todoAccess.getTodosForUser(userId)
} 

export async function deleteTodo(todoId: string, userId: string){
    return await todoAccess.deleteTodo(todoId, userId)
}
