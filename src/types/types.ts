export interface ICreateUser {
  firstName: string;
  lastName: string;
}

export interface IEditUser {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}
