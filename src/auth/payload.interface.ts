import { RoleType } from "src/common/guards/role-type";

export interface Payload {
  id: number;
  username: string;
  nickname: string;
  email: string;
  loginkey: string;
  authority: RoleType;
}