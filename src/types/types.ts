export interface ICreateUser {
  firstName: string;
  lastName: string;
  languageCode: LanguageType;
}

export interface IEditUser {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  languageCode: LanguageType;
}

export type LanguageType = "en" | "cs" | string;
