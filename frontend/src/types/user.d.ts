import { Meta } from "../types/index"
export interface IUser {
    id: number
    email: string
    userName: string
    avatar: string
    isVerified: boolean
    isBlocked: boolean
    role: Role
  }
  
  export interface Role {
    id: number
    name: string
  }

  export interface State{
    isBlocked: boolean;
    state: string;  
  }
