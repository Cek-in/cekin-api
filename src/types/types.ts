export interface ICreateUser {
  firstName: string;
  lastName: string;
  firebaseId: string;
}

export interface IEditUser {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}
