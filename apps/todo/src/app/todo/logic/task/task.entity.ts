import { TaskDTOSchema, taskSchema, TaskSchema } from "./task.schema";

export const createTaskEntity = (dto: TaskDTOSchema): TaskSchema => {
    return taskSchema.parse(dto);
}