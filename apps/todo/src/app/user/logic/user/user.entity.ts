import { UserDTOSchema, userSchema, UserSchema } from "./user.schema";

export const createUserEntity = (dto: UserDTOSchema): UserSchema => {
    return userSchema.parse(dto);
}