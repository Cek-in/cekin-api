export interface ICreateUser {
  firstName: string;
  languageCode: LanguageType;
}

export interface IEditUser {
  firstName: string;
  email: string;
  phone?: string;
  languageCode: LanguageType;
}

export type LanguageType = "en" | "cs" | string;
